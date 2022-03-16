module.exports = {
	theme: {
		extend: {
			zIndex: {
				'-1': '-1',
			},
			borderRadius: {
				inherit: 'inherit',
			},
			keyframes: {
				'fade-in': {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
				'scale-down': {
					'0%': {
						bottom: '100%',
					},
					'100%': {
						bottom: '0%',
					},
				},
			},
			animation: {
				'fade-in': 'fade-in 0.5s ease-out',
				'scale-down': 'scale-down 0.3s ease-in-out',
			},
		},
	},
	plugins: [],
};
