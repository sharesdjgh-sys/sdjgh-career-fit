// remark-cjk-friendly 적용 전/후 강조(**) 파싱 검증
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";

const sample =
  "**C(관습형, Conventional)**는 데이터를 정리하는 유형이에요. **S(사회형, Social)**는 다른 사람을 돕는 유형이에요.";

function countStrong(tree) {
  let n = 0;
  (function walk(node) {
    if (node.type === "strong") n++;
    (node.children ?? []).forEach(walk);
  })(tree);
  return n;
}

const before = unified().use(remarkParse).use(remarkGfm).parse(sample);
const after = unified().use(remarkParse).use(remarkGfm).use(remarkCjkFriendly).parse(sample);

console.log("플러그인 없이 strong 개수:", countStrong(before), "(기대: 0 — 버그 재현)");
console.log("플러그인 적용 strong 개수:", countStrong(after), "(기대: 2 — 수정 확인)");
process.exit(countStrong(after) === 2 ? 0 : 1);
