export interface CardProps {
  title: any;
  titleParentClassNames?: string;
  action?: any;
  children: any;
  className?: string;
  classNames?: { header?: string; body?: string };
}

export default function Card(props: CardProps) {
  const {
    title,
    action,
    children,
    className,
    classNames,
    titleParentClassNames,
  } = props;
  return (
    <div className={`w-full  bg-white transition-all  ${className}`}>
      {title && (
      <div
        className={`md:mx-2 h-14 w-full md:px-4 flex justify-between items-center rounded-t-lg ${classNames?.header}`}
      >
        <div
          className={
            "h-full flex text-black items-center font-semibold text-xl " +
            titleParentClassNames
          }
        >
          {title}
        </div>
        <div className="h-full flex items-center">{action}</div>
      </div>
      )}
      <div className={`${classNames?.body} md:p-4`}>{children}</div>
    </div>
  );
}
