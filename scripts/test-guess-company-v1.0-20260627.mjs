/**
 * guessCompany / looksLikeMultiCompanyList 单元测试
 * 版本: v1.0 | 日期: 2026-06-27
 */
import {
  guessCompany,
  looksLikeMultiCompanyList,
} from "../data/mock-data.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const multiList = "1、上海某智能科技有限公司 2、华东某科技发展有限公司";
assert(looksLikeMultiCompanyList(multiList), "应识别为多企业名单");
assert(
  guessCompany(multiList) === "上海某智能科技有限公司",
  "多企业名单应优先匹配完整工商名，而非某机构别名",
);

assert(
  guessCompany("帮我看看某机构") === "某智能科技有限公司",
  "纯简称仍应走别名",
);

assert(
  !looksLikeMultiCompanyList("苏州某生物医药科技有限公司"),
  "单家企业不应判为多企业名单",
);

console.log("test-guess-company-v1.0-20260627: ok");
