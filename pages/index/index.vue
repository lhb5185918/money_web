<template>
	<view class="container">
		<!-- 顶部卡片 - 总资产 -->
		<view class="overview-card">
			<view class="title">总资产(元)</view>
			<view class="amount">{{totalAssets}}</view>
			<view class="stats">
				<view class="stat-item">
					<text>本月收入</text>
					<text class="income">+{{monthlyIncome}}</text>
				</view>
				<view class="stat-item">
					<text>本月支出</text>
					<text class="expense">-{{monthlyExpense}}</text>
				</view>
			</view>
		</view>
		
		<!-- 账户列表 -->
		<view class="section account-section">
			<view class="section-header">
				<text class="section-title">家庭账户</text>
				<text class="more" @click="navigateTo('/pages/assets/assets')">查看全部</text>
			</view>
			<view class="account-list">
				<view class="account-item" v-for="(account, index) in accounts" :key="account.id"
					:style="{ animationDelay: index * 0.1 + 's' }">
					<view class="account-icon">
						<text class="iconfont" :class="{
							'icon-cash': account.type === '现金',
							'icon-bank': account.type === '银行卡',
							'icon-alipay': account.type === '支付宝',
							'icon-wechat': account.type === '微信'
						}"></text>
					</view>
					<view class="account-info">
						<text class="account-name">{{account.name}}</text>
						<text class="account-balance">￥{{account.balance}}</text>
					</view>
					<text class="account-type">{{account.type}}</text>
				</view>
			</view>
		</view>
		
		<!-- 最近交易 -->
		<view class="section transaction-section">
			<view class="section-header">
				<text class="section-title">最近交易</text>
				<text class="more" @click="navigateTo('/pages/record/record')">查看全部</text>
			</view>
			<view class="transaction-list">
				<view class="transaction-item" v-for="(transaction, index) in recentTransactions" :key="transaction.id"
					:style="{ animationDelay: index * 0.1 + 's' }">
					<view class="transaction-icon">
						<text class="iconfont" :class="{
							'icon-income': transaction.type === 1,
							'icon-expense': transaction.type === 0
						}"></text>
					</view>
					<view class="transaction-info">
						<view class="transaction-main">
							<text class="transaction-category">{{transaction.category.name}}</text>
							<text :class="['transaction-amount', transaction.type === 1 ? 'income' : 'expense']">
								{{transaction.type === 1 ? '+' : '-'}}{{transaction.amount}}
							</text>
						</view>
						<view class="transaction-sub">
							<text class="transaction-date">{{transaction.date}}</text>
							<text class="transaction-account" v-if="transaction.account">{{transaction.account.name}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 底部导航 -->
		<view class="tab-bar">
			<view class="tab-item" @click="navigateTo('/pages/index/index')">
				<text class="iconfont icon-home"></text>
				<text>首页</text>
			</view>
			<view class="tab-item" @click="navigateTo('/pages/assets/assets')">
				<text class="iconfont icon-wallet"></text>
				<text>资产</text>
			</view>
			<view class="tab-item" @click="navigateTo('/pages/statistics/statistics')">
				<text class="iconfont icon-chart"></text>
				<text>统计</text>
			</view>
		</view>

		<!-- 悬浮记账按钮 -->
		<view class="floating-button" @click="navigateTo('/pages/record/record')">
			<text class="iconfont icon-add"></text>
			<text>记账</text>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import request from '@/utils/request'

// 数据
const totalAssets = ref('128,500.00')
const monthlyIncome = ref('12,500.00')
const monthlyExpense = ref('8,300.00')
const accounts = ref([
	{ id: 1, name: '现金账户', balance: '28,500.00', type: '现金' },
	{ id: 2, name: '工商银行', balance: '50,000.00', type: '银行卡' },
	{ id: 3, name: '支付宝', balance: '30,000.00', type: '支付宝' },
	{ id: 4, name: '微信钱包', balance: '20,000.00', type: '微信' }
])
const recentTransactions = ref([
	{ 
		id: 1, 
		category: { name: '工资收入' }, 
		date: '2024-02-22',
		type: 1,
		amount: '8,000.00'
	},
	{ 
		id: 2, 
		category: { name: '购物支出' }, 
		date: '2024-02-21',
		type: 0,
		amount: '1,200.00'
	},
	{ 
		id: 3, 
		category: { name: '理财收益' }, 
		date: '2024-02-20',
		type: 1,
		amount: '500.00'
	},
	{ 
		id: 4, 
		category: { name: '日常开销' }, 
		date: '2024-02-19',
		type: 0,
		amount: '300.00'
	}
])

// 页面跳转
const navigateTo = (url) => {
	// 判断是否是tabBar页面
	const tabBarPages = ['/pages/index/index', '/pages/assets/assets', '/pages/statistics/statistics']
	if (tabBarPages.includes(url)) {
		uni.switchTab({ url })
	} else {
		uni.navigateTo({ url })
	}
}

// 初始化
onMounted(() => {
	refreshData()
})

// 刷新数据
const refreshData = async () => {
	try {
		// 获取账户列表
		const accountsRes = await request.get('/api/accounts')
		if (accountsRes.data) {
			accounts.value = accountsRes.data
		}
		
		// 获取最近交易
		const transactionsRes = await request.get('/api/transactions/recent')
		if (transactionsRes.data) {
			recentTransactions.value = transactionsRes.data
		}
		
		// 获取资产统计
		const statsRes = await request.get('/api/statistics/overview')
		if (statsRes.data) {
			totalAssets.value = statsRes.data.totalAssets
			monthlyIncome.value = statsRes.data.monthlyIncome
			monthlyExpense.value = statsRes.data.monthlyExpense
		}
	} catch (error) {
		uni.showToast({
			title: error.message || '获取数据失败',
			icon: 'none'
		})
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
	
	// 添加模块进入动画
	.section {
		animation: slideUp 0.5s ease-out;
	}
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.overview-card {
	background: linear-gradient(135deg, #2979ff, #1565c0);
	color: #fff;
	padding: 40rpx 30rpx;
	margin: 30rpx;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 20rpx rgba(41, 121, 255, 0.2);
	transform: translateY(0);
	transition: transform 0.3s ease;
	
	&:active {
		transform: translateY(2rpx);
	}
	
	.title {
		font-size: 28rpx;
		opacity: 0.9;
	}
	
	.amount {
		font-size: 72rpx;
		font-weight: bold;
		margin: 20rpx 0;
		background: linear-gradient(to right, #fff, rgba(255,255,255,0.8));
		-webkit-background-clip: text;
		color: transparent;
	}
	
	.stats {
		display: flex;
		margin-top: 30rpx;
		
		.stat-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			position: relative;
			
			&:first-child::after {
				content: '';
				position: absolute;
				right: 0;
				top: 10%;
				height: 80%;
				width: 1rpx;
				background: rgba(255,255,255,0.2);
			}
			
			text {
				font-size: 24rpx;
				
				&.income {
					color: #52c41a;
					font-size: 32rpx;
					font-weight: 500;
					text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
				}
				
				&.expense {
					color: #ff4d4f;
					font-size: 32rpx;
					font-weight: 500;
					text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
				}
			}
		}
	}
}

.section {
	background-color: #fff;
	border-radius: 20rpx;
	margin: 30rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
	
	&:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			position: relative;
			padding-left: 20rpx;
			
			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 6rpx;
				height: 32rpx;
				background: #2979ff;
				border-radius: 3rpx;
			}
		}
		
		.more {
			color: #666;
			font-size: 28rpx;
			padding: 10rpx 20rpx;
			border-radius: 30rpx;
			background: #f5f5f5;
			transition: background 0.3s ease;
			
			&:active {
				background: #e8e8e8;
			}
		}
	}
}

.account-section, .transaction-section {
	margin: 30rpx;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
	overflow: hidden;
	transform: translateY(0);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
	
	&:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
	}
}

.account-list {
	.account-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
		animation: slideInRight 0.5s ease-out forwards;
		opacity: 0;
		
		&:last-child {
			border-bottom: none;
		}
		
		.account-icon {
			width: 80rpx;
			height: 80rpx;
			background: #f0f7ff;
			border-radius: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 20rpx;
			
			.iconfont {
				font-size: 40rpx;
				color: #2979ff;
				
				&.icon-cash { color: #52c41a; }
				&.icon-bank { color: #2979ff; }
				&.icon-alipay { color: #1890ff; }
				&.icon-wechat { color: #07c160; }
			}
		}
		
		.account-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			
			.account-name {
				font-size: 32rpx;
				color: #333;
				margin-bottom: 8rpx;
			}
			
			.account-balance {
				font-size: 28rpx;
				color: #666;
			}
		}
		
		.account-type {
			font-size: 24rpx;
			color: #999;
			padding: 4rpx 16rpx;
			background: #f5f5f5;
			border-radius: 20rpx;
		}
	}
}

.transaction-list {
	.transaction-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
		animation: slideInLeft 0.5s ease-out forwards;
		opacity: 0;
		
		&:last-child {
			border-bottom: none;
		}
		
		.transaction-icon {
			width: 80rpx;
			height: 80rpx;
			background: #f0f7ff;
			border-radius: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 20rpx;
			
			.iconfont {
				font-size: 40rpx;
				
				&.icon-income {
					color: #52c41a;
				}
				
				&.icon-expense {
					color: #ff4d4f;
				}
			}
		}
		
		.transaction-info {
			flex: 1;
			
			.transaction-main {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8rpx;
				
				.transaction-category {
					font-size: 32rpx;
					color: #333;
				}
				
				.transaction-amount {
					font-size: 32rpx;
					font-weight: 500;
					
					&.income {
						color: #52c41a;
					}
					
					&.expense {
						color: #ff4d4f;
					}
				}
			}
			
			.transaction-sub {
				display: flex;
				align-items: center;
				
				.transaction-date {
					font-size: 24rpx;
					color: #999;
				}
				
				.transaction-account {
					font-size: 24rpx;
					color: #999;
					margin-left: 20rpx;
					padding: 2rpx 12rpx;
					background: #f5f5f5;
					border-radius: 20rpx;
				}
			}
		}
	}
}

@keyframes slideInRight {
	from {
		opacity: 0;
		transform: translateX(30rpx);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

@keyframes slideInLeft {
	from {
		opacity: 0;
		transform: translateX(-30rpx);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

.tab-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	background-color: #fff;
	display: flex;
	align-items: center;
	padding-bottom: env(safe-area-inset-bottom);
	box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
	z-index: 100;
	
	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #666;
		padding: 10rpx 0;
		transition: color 0.3s ease;
		
		&.active {
			color: #2979ff;
		}
		
		.iconfont {
			font-size: 40rpx;
			margin-bottom: 4rpx;
		}
		
		text {
			font-size: 24rpx;
			line-height: 1;
		}
	}
}

.floating-button {
	position: fixed;
	right: 40rpx;
	bottom: calc(140rpx + env(safe-area-inset-bottom));
	width: 120rpx;
	height: 120rpx;
	background: linear-gradient(135deg, #2979ff, #1565c0);
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #fff;
	box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.3);
	z-index: 99;
	transition: transform 0.3s ease;
	
	&:active {
		transform: scale(0.95);
	}
	
	.iconfont {
		font-size: 48rpx;
		margin-bottom: 4rpx;
	}
	
	text:last-child {
		font-size: 24rpx;
	}
}

// 暗黑模式支持
@media (prefers-color-scheme: dark) {
	.container {
		background-color: #1a1a1a;
	}
	
	.overview-card {
		background: linear-gradient(135deg, #1565c0, #0d47a1);
	}
	
	.section {
		background-color: #2c2c2c;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
		
		&:active {
			box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
		}
		
		.section-header {
			.more {
				background: #333;
				
				&:active {
					background: #404040;
				}
			}
		}
	}
	
	.account-section, .transaction-section {
		background: #2c2c2c;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
	}
	
	.account-list .account-item {
		border-bottom-color: #333;
		
		&:active {
			background: #333;
		}
		
		.account-icon {
			background: #1a1a1a;
		}
		
		.account-info {
			.account-name {
				color: #fff;
			}
			
			.account-balance {
				color: #999;
			}
		}
		
		.account-type {
			background: #1a1a1a;
			color: #666;
		}
	}
	
	.transaction-list .transaction-item {
		border-bottom-color: #333;
		
		&:active {
			background: #333;
		}
		
		.transaction-icon {
			background: #1a1a1a;
		}
		
		.transaction-info {
			.transaction-main {
				.transaction-category {
					color: #fff;
				}
			}
			
			.transaction-sub {
				.transaction-date,
				.transaction-account {
					color: #666;
				}
				
				.transaction-account {
					background: #1a1a1a;
				}
			}
		}
	}
	
	.tab-bar {
		background-color: #2c2c2c;
		box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.2);
	}
	
	.floating-button {
		background: linear-gradient(135deg, #1565c0, #0d47a1);
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
	}
}
</style> 