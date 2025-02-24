<template>
	<view class="icons-container">
		<!-- 首页图标 -->
		<view class="icon-group">
			<view class="icon-item">
				<uni-icons type="home" size="24" color="#7A7E83"></uni-icons>
			</view>
			<view class="icon-item active">
				<uni-icons type="home-filled" size="24" color="#007AFF"></uni-icons>
			</view>
		</view>
		
		<!-- 资产图标 -->
		<view class="icon-group">
			<view class="icon-item">
				<uni-icons type="wallet" size="24" color="#7A7E83"></uni-icons>
			</view>
			<view class="icon-item active">
				<uni-icons type="wallet-filled" size="24" color="#007AFF"></uni-icons>
			</view>
		</view>
		
		<!-- 统计图标 -->
		<view class="icon-group">
			<view class="icon-item">
				<uni-icons type="chart" size="24" color="#7A7E83"></uni-icons>
			</view>
			<view class="icon-item active">
				<uni-icons type="chart-filled" size="24" color="#007AFF"></uni-icons>
			</view>
		</view>
	</view>
</template>

<style>
.icons-container {
	padding: 50px;
	background-color: #fff;
}

.icon-group {
	margin-bottom: 50px;
	display: flex;
	justify-content: space-around;
}

.icon-item {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
	border: 1px solid #eee;
	margin: 0 20px;
}

.icon-item.active {
	background-color: #f5f5f5;
}
</style> 