import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Title case helper
function toTitleCase(text: string) {
  return text
    .split(/[-_ ]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

type Props = {
  navPath: string[];
  setNavPath: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function Breadcrumbs({ navPath, setNavPath }: Props) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {navPath.map((item, index) => {
          const last = index === navPath.length - 1;
          const label = toTitleCase(item);

          return (
            <span key={index} className="flex items-center">
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="cursor-pointer"
                    onClick={() => setNavPath(navPath.slice(0, index + 1))}
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!last && <BreadcrumbSeparator />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
