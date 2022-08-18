import ErrorCard from './error'
import NSFWCard from './nsfwWarning'
import TopCard from './top'
import AuthorCard from './author'
import DetailCard from './detail'
import IllustCard from './illust'
import ResavingCard from './resaving'
import CreditCard from './credit'
import RandomCard from './random'
import NotificationCard from './notification'
import TagCard from './tag'
import ChineseCommandMapping from './chineseCommandMapping'
import ProfileCard from './profile'

export namespace cards {
    export const error = ErrorCard;
    export const nsfw = NSFWCard;
    export const top = TopCard;
    export const author = AuthorCard;
    export const detail = DetailCard;
    export const illust = IllustCard;
    export const resaving = ResavingCard;
    export const credit = CreditCard;
    export const random = RandomCard;
    export const notification = NotificationCard;
    export const tag = TagCard;
    export const chineseCommandMapping = ChineseCommandMapping;
    export const profile = ProfileCard;
}
