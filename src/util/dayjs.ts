import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(advancedFormat);   // enables Do, Wo, Qo ordinal tokens
dayjs.extend(relativeTime);     // enables .fromNow(), .toNow(), etc.
dayjs.extend(localizedFormat);  // enables LT, LTS, L, LL, LLL, LLLL

export default dayjs;
