'use client';

import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';
import { useServerInsertedHTML } from 'next/navigation';
import type { PropsWithChildren } from 'react';

const AntdRegistry = ({ children }: PropsWithChildren) => {
  const cache = createCache();

  useServerInsertedHTML(() => (
    <style
      id="antd"
      dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
    />
  ));

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
};

export default AntdRegistry;