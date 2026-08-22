import Image from "next/image";

type Props = {
  src: string;
  overlayOpacity?: number;
};

export function PageBackground({ src, overlayOpacity = 0.7 }: Props) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Image
          src="/images/bg-home.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-background dark:bg-background"
        style={{ opacity: overlayOpacity }}
      />
    </>
  );
}