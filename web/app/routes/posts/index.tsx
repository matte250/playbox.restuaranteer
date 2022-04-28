import { json, Link, useLoaderData } from 'remix';
import { getPosts } from '../../models/posts.server';

export const loader = async () => json(await getPosts());

export default () => {
	const posts = useLoaderData<Awaited<ReturnType<typeof getPosts>>>();
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
};
