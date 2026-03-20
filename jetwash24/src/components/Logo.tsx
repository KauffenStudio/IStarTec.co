import Image from 'next/image';

type LogoProps = {
  variant?: 'color' | 'white';
  width?: number;
  height?: number;
  className?: string;
};

export function Logo({
  variant = 'white',
  width = 160,
  height = 48,
  className = '',
}: LogoProps) {
  const src = variant === 'white' ? '/logo-white.svg' : '/logo.svg';

  return (
    <Image
      src={src}
      alt="Jetwash24"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
