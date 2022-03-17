import React from 'react';
import { json, Link, useLoaderData } from 'remix';
import { getPosts, Post } from '../../post';

export const loader = async () => json(await getPosts());

// eslint-disable-next-line func-names
export default function () {
	const posts = useLoaderData<Array<Post>>();
	return (
		<div>
			<h1>Posts</h1>
			<ul>
				{posts.map((post) => (
					<li key={post.slug}>
						<Link to={post.slug}>{post.title}</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
