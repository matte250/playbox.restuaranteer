export type Post = {
	slug: string;
	title: string;
};

export const getPosts = () => {
	const posts: Post[] = [
		{
			slug: 'why-do-we-only-eat-kebab',
			title: 'Why do we only eat kebab!',
		},
		{
			slug: 'kebab-has-ruined-my-life-and-why-it-will-ruin-yours-aswell',
			title: 'Kebab has ruined my life and why it will ruin yours aswell',
		},
	];
	return posts;
};
