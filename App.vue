<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
	console.log('App Launch')
})

onShow(() => {
	console.log('App Show')
})

onHide(() => {
	console.log('App Hide')
})
</script>

<style>
	/*每个页面公共css */
	page {
		background-color: #f5f5f5;
	}

	/* 统一字体大小 */
	text {
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
			sans-serif;
	}

	/* 统一卡片样式 */
	.uni-card {
		margin: 15px !important;
		border-radius: 8px !important;
	}
</style>
