import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import BlogCard from '../../src/components/BlogCard.astro';
import { JSDOM } from 'jsdom';

// Mock post data for the test
const mockPost = {
  id: '1',
  slug: 'test-post',
  body: '',
  collection: 'blog',
  data: {
    title: 'Test Post',
    description: 'This is a test post.',
    publishDate: new Date('2024-01-01'),
    category: 'Tutoriels',
    image: '/images/test.jpg',
    imageAlt: 'Test Image',
    readingTime: 5,
  },
};

test('BlogCard arrow should not be transformed in LTR', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BlogCard, {
    props: { post: mockPost },
  });

  const dom = new JSDOM(result);
  const svg = dom.window.document.querySelector('svg');
  const transform = svg.style.transform;

  expect(transform).toBe('');
});

test('BlogCard arrow should have rtl class', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(BlogCard, {
      props: { post: mockPost },
    });

    const dom = new JSDOM(result);
    const document = dom.window.document;
    const svg = document.querySelector('svg');

    expect(svg.classList.contains('rtl-arrow')).toBe(true);
  });