import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as pixiv from './common';
import axios from 'axios';
import config from 'configs/config';
import { bot } from 'init/client';

class Illust extends AppCommand {
    code = 'illust'; // 只是用作标记
    trigger = 'illust'; // 用于触发的文字
    intro = 'Illustration';
    func: AppFunc<BaseSession> = async (session) => {
        if (pixiv.common.isRateLimited(session, 3, this.trigger)) return;
        pixiv.common.logInvoke(`.pixiv ${this.trigger}`, session);
        async function sendCard(data: any) {
            if (data.x_restrict !== 0) {
                return session.sendCard(pixiv.cards.illust(data, pixiv.common.akarin));
            }
            const sendResult = (await session.sendCard(pixiv.cards.resaving("多张图片")));
            const loadingBarMessageID = sendResult.msgSent?.msgId;
            if (sendResult.resultType != "SUCCESS" || loadingBarMessageID == undefined) {
                bot.logger.error(sendResult.detail);
                return bot.logger.error("Message sending failed");
            }
            const detectionResult = (await pixiv.aligreen.imageDetectionSync([data]))[data.id];
            var uploadResult: {
                link: string;
                pid: string;
            } = { link: pixiv.common.akarin, pid: "没有了" };
            await pixiv.common.uploadImage(data, detectionResult, session).then((res) => {
                uploadResult = res;
            }).catch((e) => {
                if (e) {
                    console.error(e);
                    session.sendCardTemp(pixiv.cards.error(e, true));
                }
            });
            bot.logger.info(`Process ended, presenting to user`);
            session.updateMessage(loadingBarMessageID, [pixiv.cards.illust(data, uploadResult.link)])
        }
        if (session.args.length === 0) {
            return session.reply("使用 `.pixiv help illust` 查询指令详细用法")
        } else {
            if (isNaN(parseInt(session.args[0]))) {
                return session.reply(`插画ID必须是纯数字！请输入一个合法的插画ID（收到 ${session.args[0]}）\n（使用 \`.pixiv help detail\` 查询指令详细用法）`)
            }
            axios({
                url: `${config.pixivAPIBaseURL}/illustrationDetail`,
                method: "GET",
                params: {
                    keyword: session.args[0]
                }
            }).then((res: any) => {
                if (res.data.hasOwnProperty("status") && res.data.status === 404) {
                    return session.reply("插画不存在或已被删除！")
                }
                if (res.data.hasOwnProperty("status") && res.data.status == 400) {
                    return session.reply("插画ID不合法！")
                }
                if (res.data.hasOwnProperty("code") && res.data.code == 500) {
                    return session.reply("Pixiv官方服务器不可用，请稍后再试");
                }
                pixiv.common.getNotifications(session);
                sendCard(res.data);
            }).catch((e: any) => {
                if (e) {
                    console.error(e);
                    session.sendCardTemp(pixiv.cards.error(e, true));
                }
            });
        }
    };
}

export const illust = new Illust();


