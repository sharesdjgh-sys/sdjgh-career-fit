import ReactMarkdown from "react-markdown";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkGfm from "remark-gfm";

/** AI 생성 텍스트(짧은 단락·목록 위주)를 마크다운으로 렌더링. 글자 크기·색은 className으로 부모에서 지정 */
export default function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className ? `md-body ${className}` : "md-body"}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkCjkFriendly]}>{children}</ReactMarkdown>
    </div>
  );
}
