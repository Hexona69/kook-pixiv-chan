
import axios from 'axios';
import * as pixiv from 'commands/pixiv/common'
import FormData from 'form-data';
import got from 'got/dist/source';
import { bot } from 'init/client';
import { ButtonClickedEvent } from "kasumi.js";
import sharp from 'sharp';
export default async function (event: ButtonClickedEvent, action: string[], data: any) {
    const trigger = data.trigger;
    switch (trigger) {
        case 'multi': {
            let idx = data.index,
                pid = data.pid,
                link = data.link,
                type = data.type,
                curIndex = pid[idx],
                curLink = link[idx];
            pixiv.common.getIllustDetail(curIndex).then(async (res) => {
                await bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res, curLink, idx, pid, link, type, {
                    isVIP: true,
                    isSent: true
                }, data), undefined, event.authorId);
                const pdata = res;
                const originalImageURL = (pdata.page_count > 1 ? pdata.meta_pages[0].image_urls.original : pdata.meta_single_page.original_image_url) || pixiv.common.akarin;
                const master1200 = pixiv.common.getProxiedImageLink(originalImageURL.replace(/\/c\/[a-zA-z0-9]+/gm, "")); // Get image link
                bot.logger.debug(`ApexConnect: Downloading ${master1200}`);
                var bodyFormData = new FormData();
                const stream = got.stream(master1200);                               // Get readable stream from origin
                const censor = pixiv.linkmap.getDetection(curIndex, "0");
                var sp = sharp(await pixiv.common.stream2buffer(stream))
                if (censor.blur) sp = sp.blur(censor.blur);
                var buffer = await (sp.jpeg({ quality: 90 }).toBuffer()); // Encode to jpeg and convert to buffer
                bodyFormData.append('file', buffer, "image.png");
                await axios({
                    method: "post",
                    url: "https://www.kookapp.cn/api/v3/asset/create",
                    data: bodyFormData,
                    headers: {
                        'Authorization': `Bot ${await pixiv.common.getNextToken()}`,
                        ...bodyFormData.getHeaders()
                    }
                }).then((res: any) => {
                    bot.logger.debug(`ApexConnect: Upload ${curIndex} success`);
                    const link = res.data.data.url;
                    const body = {
                        kook: {
                            user_id: event.authorId,
                            username: event.author.username,
                            identify_num: event.author.identify_num
                        },
                        pixiv: {
                            illust_id: curIndex,
                            illust_page: "0",
                            image_original: master1200,
                            image_censored: link,
                            aliyun_result: {
                                "raw": pixiv.linkmap.getDetection(curIndex, "0"),
                                "suggestion": pixiv.linkmap.getSuggestion(curIndex, "0")
                            }
                        }
                    }
                    // console.dir(body, { depth: null });
                    pixiv.common.sendApexImage(body).then(() => {
                        pixiv.common.getIllustDetail(curIndex).then((res) => {
                            bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res, curLink, idx, pid, link, type, {
                                isVIP: true,
                                isSuccess: true
                            }, data), undefined, event.authorId).then(() => {
                                setTimeout(() => {
                                    pixiv.common.getApexVIPStatus(event.authorId).then((rep) => {
                                        bot.API.message.update(event.targetMsgId, pixiv.cards.multiDetail(res, curLink, idx, pid, link, type, { isVIP: rep.data.is_vip }, data), undefined, event.authorId);
                                    })
                                }, 1500);
                            })
                        }).catch((e: any) => {
                            if (e) {
                                bot.logger.error(e);
                            }
                        });
                    });
                }).catch(async (e) => {
                    bot.logger.warn(`ApexConnect: Upload ${curIndex} failed`);
                    bot.logger.warn(e);
                    bot.API.message.update(event.channelId, pixiv.cards.error(e.stack), undefined, event.authorId);
                });
            }).catch((e: any) => {
                if (e) {
                    bot.logger.error(e);
                }
            });
        };
        case 'detail': {
            let curIndex = data.pid,
                curLink = data.link;
            await pixiv.common.getIllustDetail(curIndex).then((res) => {
                bot.API.message.update(event.targetMsgId, pixiv.cards.detail(res, curLink, {
                    isVIP: true,
                    isSent: true
                }), undefined, event.authorId);
            }).catch((e: any) => {
                if (e) {
                    bot.logger.error(e);
                }
            });
            pixiv.common.getIllustDetail(curIndex).then(async (res) => {
                const pdata = res;
                const originalImageURL = (pdata.page_count > 1 ? pdata.meta_pages[0].image_urls.original : pdata.meta_single_page.original_image_url) || pixiv.common.akarin;
                const master1200 = pixiv.common.getProxiedImageLink(originalImageURL.replace(/\/c\/[a-zA-z0-9]+/gm, "")); // Get image link
                bot.logger.debug(`ApexConnect: Downloading ${master1200}`);
                var bodyFormData = new FormData();
                const stream = got.stream(master1200);                               // Get readable stream from origin
                const censor = pixiv.linkmap.getDetection(curIndex, "0");
                var sp = sharp(await pixiv.common.stream2buffer(stream))
                if (censor.blur) sp = sp.blur(censor.blur);
                var buffer = await (sp.jpeg({ quality: 90 }).toBuffer()); // Encode to jpeg and convert to buffer
                bodyFormData.append('file', buffer, "image.png");
                await axios({
                    method: "post",
                    url: "https://www.kookapp.cn/api/v3/asset/create",
                    data: bodyFormData,
                    headers: {
                        'Authorization': `Bot ${await pixiv.common.getNextToken()}`,
                        ...bodyFormData.getHeaders()
                    }
                }).then((res: any) => {
                    bot.logger.debug(`ApexConnect: Upload ${curIndex} success`);
                    const link = res.data.data.url;
                    const body = {
                        kook: {
                            user_id: event.authorId,
                            username: event.author.username,
                            identify_num: event.author.identify_num
                        },
                        pixiv: {
                            illust_id: curIndex,
                            illust_page: "0",
                            image_original: master1200,
                            image_censored: link,
                            aliyun_result: {
                                "raw": pixiv.linkmap.getDetection(curIndex, "0"),
                                "suggestion": pixiv.linkmap.getSuggestion(curIndex, "0")
                            }
                        }
                    }
                    // console.dir(body, { depth: null });
                    pixiv.common.sendApexImage(body).then(() => {
                        pixiv.common.getIllustDetail(curIndex).then((res) => {
                            bot.API.message.update(event.targetMsgId, pixiv.cards.detail(res, curLink, {
                                isVIP: true,
                                isSuccess: true
                            }), undefined, event.authorId).then(() => {
                                setTimeout(() => {
                                    pixiv.common.getApexVIPStatus(event.authorId).then((rep) => {
                                        bot.API.message.update(event.targetMsgId, pixiv.cards.detail(res, curLink, { isVIP: rep.data.is_vip }), undefined, event.authorId);
                                    })
                                }, 1500);
                            })
                        }).catch((e: any) => {
                            if (e) {
                                bot.logger.error(e);
                            }
                        });
                    });
                }).catch(async (e) => {
                    bot.logger.warn(`ApexConnect: Upload ${curIndex} failed`);
                    bot.logger.warn(e);
                    bot.API.message.update(event.channelId, pixiv.cards.error(e.stack), undefined, event.authorId);
                });
            }).catch((e: any) => {
                if (e) {
                    bot.logger.error(e);
                }
            });
        };
    }
}