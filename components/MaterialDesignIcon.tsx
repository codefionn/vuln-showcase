import { asset } from "$fresh/runtime.ts";

interface MaterialDesignIconProps {
  fileName: string;
  alt: string;
}

export default function MaterialDesignIcon(props: MaterialDesignIconProps) {
  return (
    <img
      className="material-design-icon"
      width="24"
      height="24"
      src={asset(
        "/material-design-icons/svg/filled/" + props.fileName + ".svg",
      )}
      alt={props.alt}
    />
  );
}
