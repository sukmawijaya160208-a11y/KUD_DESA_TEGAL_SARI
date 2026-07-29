'use client';

import { AnimateIcon } from '@/components/animate-ui/icons/icon';

const ICON_MAP = {};

export function AnimatedIcon({ icon: Icon, animateOnHover = true, className, size, ...props }) {
  return (
    <AnimateIcon animateOnHover={animateOnHover} {...props}>
      <Icon className={className} size={size} />
    </AnimateIcon>
  );
}
