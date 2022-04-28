import { json, useLoaderData } from 'remix';
import type { LoaderFunction } from 'remix';
import invariant from 'tiny-invariant';
import { getPost } from '../../models/posts.server';

export const loader: LoaderFunction = async ({ params }) => {
	invariant(params.slug, 'expected params.slug');
	return json(await getPost(params.slug));
};

export default () => {
	const post = useLoaderData();

	return (
		<main>
			<h1>{post.title}</h1>
			{/* eslint-disable-next-line react/no-danger */}
			<div dangerouslySetInnerHTML={{ __html: post.html }} />
		</main>
	);
};
