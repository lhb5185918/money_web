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
		<view class="section">
			<view class="section-header">
				<text class="section-title">我的账户</text>
				<text class="more" @click="navigateTo('/pages/assets/assets')">查看全部</text>
			</view>
			<view class="account-list">
				<view class="account-item" v-for="account in accounts" :key="account.id">
					<view class="account-info">
						<text class="account-name">{{account.name}}</text>
						<text class="account-balance">{{account.balance}}</text>
					</view>
					<text class="account-type">{{account.type}}</text>
				</view>
			</view>
		</view>
		
		<!-- 最近交易 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">最近交易</text>
				<text class="more" @click="navigateTo('/pages/record/record')">查看全部</text>
			</view>
			<view class="transaction-list">
				<view class="transaction-item" v-for="transaction in recentTransactions" :key="transaction.id">
					<view class="transaction-info">
						<text class="transaction-category">{{transaction.category.name}}</text>
						<text class="transaction-date">{{transaction.date}}</text>
					</view>
					<text :class="['transaction-amount', transaction.type === 1 ? 'income' : 'expense']">
						{{transaction.type === 1 ? '+' : '-'}}{{transaction.amount}}
					</text>
				</view>
			</view>
		</view>
		
		<!-- 底部导航 -->
		<view class="tab-bar">
			<view class="tab-item active">
				<text class="iconfont icon-home"></text>
				<text>首页</text>
			</view>
			<view class="tab-item" @click="navigateTo('/pages/assets/assets')">
				<text class="iconfont icon-wallet"></text>
				<text>资产</text>
			</view>
			<view class="tab-item">
				<text style="opacity: 0;">占位</text>
			</view>
			<view class="tab-item" @click="navigateTo('/pages/record/record')">
				<text class="iconfont icon-transaction"></text>
				<text>记录</text>
			</view>
			<view class="tab-item" @click="navigateTo('/pages/statistics/statistics')">
				<text class="iconfont icon-chart"></text>
				<text>统计</text>
			</view>
		</view>

		<!-- 记账按钮 -->
		<view class="floating-btn" @click="showRecordModal">
			<text class="iconfont icon-add"></text>
		</view>

		<!-- 记账弹窗 -->
		<uni-popup ref="popup" type="center">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">记一笔</text>
					<text class="close-btn" @click="hideRecordModal">×</text>
				</view>
				
				<view class="modal-body">
					<uni-forms ref="form" :modelValue="formData" :rules="rules">
						<uni-forms-item name="type">
							<uni-segmented-control 
								:current="formData.type" 
								:values="['支出', '收入']"
								@clickItem="handleTypeChange"
							/>
						</uni-forms-item>
						
						<uni-forms-item name="amount">
							<uni-easyinput
								v-model="formData.amount"
								type="number"
								placeholder="请输入金额"
							/>
						</uni-forms-item>
						
						<uni-forms-item name="category_id">
							<view class="select-input" @click="showCategoryPicker">
								<text class="select-value">{{formData.category_id ? categories.find(item => item.value === formData.category_id)?.text : '请选择分类'}}</text>
								<text class="select-arrow iconfont icon-arrow-down"></text>
							</view>
						</uni-forms-item>
						
						<uni-forms-item name="account_id">
							<view class="select-input" @click="showAccountPicker">
								<text class="select-value">{{formData.account_id ? accounts.find(item => item.id === formData.account_id)?.name : '请选择账户'}}</text>
								<text class="select-arrow iconfont icon-arrow-down"></text>
							</view>
						</uni-forms-item>
						
						<uni-forms-item name="date">
							<uni-datetime-picker
								v-model="formData.date"
								type="date"
								:clear-icon="false"
							/>
						</uni-forms-item>
					</uni-forms>
				</view>
				
				<view class="modal-footer">
					<button class="cancel-btn" @click="hideRecordModal">取消</button>
					<button class="confirm-btn" type="primary" @click="handleSubmit">确定</button>
				</view>
			</view>
		</uni-popup>

		<!-- 分类选择弹窗 -->
		<uni-popup ref="categoryPicker" type="bottom" background-color="none" safe-area>
			<view class="picker-popup">
				<view class="picker-header">
					<text class="picker-title">选择分类</text>
					<text class="close-btn iconfont icon-close" @click="hideCategoryPicker">×</text>
				</view>
				<view class="picker-body">
					<view 
						v-for="item in categories" 
						:key="item.value"
						class="picker-item"
						:class="{ active: formData.category_id === item.value }"
						@click="handleCategorySelect(item)"
					>
						<text>{{item.text}}</text>
						<text class="iconfont icon-check" v-if="formData.category_id === item.value">✓</text>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 账户选择弹窗 -->
		<uni-popup ref="accountPicker" type="bottom" background-color="none" safe-area>
			<view class="picker-popup">
				<view class="picker-header">
					<text class="picker-title">选择账户</text>
					<text class="close-btn iconfont icon-close" @click="hideAccountPicker">×</text>
				</view>
				<view class="picker-body">
					<view 
						v-for="item in accounts" 
						:key="item.id"
						class="picker-item"
						:class="{ active: formData.account_id === item.id }"
						@click="handleAccountSelect(item)"
					>
						<text>{{item.name}}</text>
						<text class="iconfont icon-check" v-if="formData.account_id === item.id">✓</text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

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

// 记账表单数据
const popup = ref(null)
const form = ref(null)
const formData = reactive({
	type: 0,
	amount: '',
	category_id: '',
	account_id: '',
	date: new Date().toISOString().split('T')[0]
})

// 分类选项
const categories = ref([
	{ value: 1, text: '工资收入' },
	{ value: 2, text: '购物支出' },
	{ value: 3, text: '理财收益' },
	{ value: 4, text: '日常开销' },
	{ value: 5, text: '交通出行' },
	{ value: 6, text: '餐饮美食' }
])

// 账户选项
const accountOptions = computed(() => {
	return accounts.value.map(account => ({
		value: account.id,
		text: account.name
	}))
})

// 表单验证规则
const rules = {
	amount: {
		rules: [{
			required: true,
			errorMessage: '请输入金额'
		}]
	},
	category_id: {
		rules: [{
			required: true,
			errorMessage: '请选择分类'
		}]
	},
	account_id: {
		rules: [{
			required: true,
			errorMessage: '请选择账户'
		}]
	}
}

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

// 显示记账弹窗
const showRecordModal = () => {
	// 重置表单数据
	Object.assign(formData, {
		type: 0,
		amount: '',
		category_id: '',
		account_id: '',
		date: new Date().toISOString().split('T')[0]
	})
	popup.value.open()
}

// 隐藏记账弹窗
const hideRecordModal = () => {
	popup.value.close()
}

// 处理类型切换
const handleTypeChange = (e) => {
	formData.type = e.currentIndex
}

// 处理表单提交
const handleSubmit = async () => {
	try {
		const valid = await form.value.validate()
		if (valid) {
			// 模拟添加交易
			const newTransaction = {
				id: Date.now(),
				type: formData.type,
				amount: formData.amount,
				category: {
					id: formData.category_id,
					name: categories.value.find(item => item.value === formData.category_id)?.text
				},
				account: {
					id: formData.account_id,
					name: accounts.value.find(item => item.id === formData.account_id)?.name
				},
				date: formData.date
			}
			
			// 添加到最近交易列表
			recentTransactions.value.unshift(newTransaction)
			// 只保留前4条记录
			recentTransactions.value = recentTransactions.value.slice(0, 4)
			
			// 更新账户余额
			const accountIndex = accounts.value.findIndex(item => item.id === formData.account_id)
			if (accountIndex !== -1) {
				const currentBalance = parseFloat(accounts.value[accountIndex].balance.replace(',', ''))
				const amount = parseFloat(formData.amount)
				const newBalance = formData.type === 1 ? currentBalance + amount : currentBalance - amount
				accounts.value[accountIndex].balance = newBalance.toFixed(2)
			}
			
			// 更新总资产和月度收支
			const amount = parseFloat(formData.amount)
			if (formData.type === 1) {
				const income = parseFloat(monthlyIncome.value.replace(',', ''))
				monthlyIncome.value = (income + amount).toFixed(2)
			} else {
				const expense = parseFloat(monthlyExpense.value.replace(',', ''))
				monthlyExpense.value = (expense + amount).toFixed(2)
			}
			
			// 更新总资产
			const total = parseFloat(totalAssets.value.replace(',', ''))
			totalAssets.value = (formData.type === 1 ? total + amount : total - amount).toFixed(2)
			
			uni.showToast({
				title: '记账成功',
				icon: 'success'
			})
			
			hideRecordModal()
		}
	} catch (error) {
		uni.showToast({
			title: error.message || '操作失败',
			icon: 'none'
		})
	}
}

// 选择器引用
const categoryPicker = ref(null)
const accountPicker = ref(null)

// 显示/隐藏分类选择器
const showCategoryPicker = () => {
	categoryPicker.value.open()
}

const hideCategoryPicker = () => {
	categoryPicker.value.close()
}

// 显示/隐藏账户选择器
const showAccountPicker = () => {
	accountPicker.value.open()
}

const hideAccountPicker = () => {
	accountPicker.value.close()
}

// 处理分类选择
const handleCategorySelect = (item) => {
	formData.category_id = item.value
	hideCategoryPicker()
}

// 处理账户选择
const handleAccountSelect = (item) => {
	formData.account_id = item.id
	hideAccountPicker()
}

// 初始化
onMounted(() => {
	// 使用模拟数据,暂时不调用API
})
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

.account-list {
	.account-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		transition: background 0.3s ease;
		
		&:active {
			background: #f9f9f9;
		}
		
		&:last-child {
			border-bottom: none;
		}
		
		.account-info {
			.account-name {
				font-size: 32rpx;
				color: #333;
			}
			
			.account-balance {
				font-size: 28rpx;
				color: #666;
				margin-left: 20rpx;
			}
		}
		
		.account-type {
			color: #999;
			font-size: 28rpx;
			padding: 4rpx 16rpx;
			background: #f5f5f5;
			border-radius: 20rpx;
		}
	}
}

.transaction-list {
	.transaction-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		transition: background 0.3s ease;
		
		&:active {
			background: #f9f9f9;
		}
		
		&:last-child {
			border-bottom: none;
		}
		
		.transaction-info {
			.transaction-category {
				font-size: 32rpx;
				color: #333;
			}
			
			.transaction-date {
				font-size: 24rpx;
				color: #999;
				margin-left: 20rpx;
			}
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
}

.tab-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	background-color: #fff;
	display: flex;
	padding-bottom: env(safe-area-inset-bottom);
	box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
	
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
			animation: tabActive 0.3s ease;
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

@keyframes tabActive {
	0% { transform: scale(1); }
	50% { transform: scale(1.1); }
	100% { transform: scale(1); }
}

.floating-btn {
	position: fixed;
	bottom: calc(120rpx + env(safe-area-inset-bottom));
	left: 50%;
	transform: translateX(-50%);
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #2979ff, #1565c0);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(41, 121, 255, 0.4);
	z-index: 99;
	transition: transform 0.3s ease, box-shadow 0.3s ease;
	
	&::before {
		content: '+';
		color: #fff;
		font-size: 60rpx;
		font-weight: 300;
		margin-top: -6rpx;
	}
	
	&:active {
		transform: translate(-50%, 2rpx);
		box-shadow: 0 4rpx 12rpx rgba(41, 121, 255, 0.4);
	}
	
	.iconfont {
		display: none;
	}
}

.modal-content {
	background-color: #fff;
	border-radius: 20rpx;
	width: 650rpx;
	max-height: 90vh;
	overflow-y: auto;
	animation: modalShow 0.3s ease-out;
	position: relative;
	
	.modal-header {
		padding: 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.modal-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}
		
		.close-btn {
			font-size: 48rpx;
			color: #999;
			padding: 0 20rpx;
			transition: color 0.3s ease;
			
			&:active {
				color: #666;
			}
		}
	}
	
	.modal-body {
		padding: 30rpx;
		position: relative;
		
		:deep(.uni-forms-item) {
			margin-bottom: 40rpx;
			animation: formItemShow 0.3s ease-out;
			animation-fill-mode: both;
			
			@for $i from 1 through 6 {
				&:nth-child(#{$i}) {
					animation-delay: #{$i * 0.1}s;
				}
			}
			
			.uni-forms-item__inner {
				padding: 0;
			}
			
			.uni-forms-item__label {
				margin-bottom: 10rpx;
				font-size: 28rpx;
				color: #666;
			}
			
			.uni-forms-item__content {
				min-height: 80rpx;
			}
		}
		
		.select-input {
			height: 80rpx;
			border: 1rpx solid #ddd;
			border-radius: 8rpx;
			padding: 0 24rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			justify-content: space-between;
			transition: all 0.3s ease;
			
			&:active {
				background-color: #f5f5f5;
			}
			
			.select-value {
				font-size: 30rpx;
				color: #333;
			}
			
			.select-arrow {
				color: #999;
				font-size: 24rpx;
				transition: transform 0.3s ease;
			}
		}
		
		:deep(.uni-segmented-control) {
			margin-bottom: 30rpx;
			
			.segmented-control__item {
				height: 70rpx;
				line-height: 70rpx;
				font-size: 30rpx;
			}
		}
		
		:deep(.uni-easyinput__content),
		:deep(.uni-data-select) {
			height: 80rpx;
			border: 1rpx solid #ddd;
			border-radius: 8rpx;
			transition: border-color 0.3s ease;
			background-color: #fff;
			position: relative;
			
			&:focus-within {
				border-color: #2979ff;
			}
			
			.uni-easyinput__content-input {
				font-size: 30rpx;
				color: #333;
			}
			
			.uni-data-select__input-text {
				font-size: 30rpx;
				color: #333;
				height: 80rpx;
				line-height: 80rpx;
				padding: 0 24rpx;
			}
			
			.uni-data-select__input-placeholder {
				color: #999;
				font-size: 30rpx;
			}
			
			.uni-select__selector-wrap {
				position: fixed;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				z-index: 9999;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: rgba(0, 0, 0, 0.4);
				
				.uni-select__selector {
					pointer-events: auto;
					width: 590rpx;
					background-color: #fff;
					border-radius: 16rpx;
					box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
					max-height: 600rpx;
					overflow-y: auto;
					
					.uni-select__selector-item {
						padding: 24rpx;
						font-size: 30rpx;
						color: #333;
						transition: background-color 0.3s ease;
						border-bottom: 1rpx solid #f5f5f5;
						background-color: #fff;
						
						&:last-child {
							border-bottom: none;
						}
						
						&:active {
							background-color: #f5f5f5;
						}
						
						&.active {
							color: #2979ff;
							background-color: #f0f7ff;
						}
					}
				}
			}
			
			.uni-select__input-border {
				display: none;
			}
			
			.uni-select__input-arrow {
				position: absolute;
				right: 24rpx;
				top: 50%;
				transform: translateY(-50%);
				transition: transform 0.3s ease;
				color: #999;
				font-size: 24rpx;
				
				&.active {
					transform: translateY(-50%) rotate(180deg);
				}
			}
		}
		
		:deep(.uni-date) {
			width: 100%;
			
			.uni-date-editor {
				width: 100%;
				height: 80rpx;
				border: 1rpx solid #ddd;
				border-radius: 8rpx;
				padding: 0;
				display: flex;
				align-items: center;
				background-color: #fff;
				transition: border-color 0.3s ease;
				
				&--x {
					width: 100%;
					height: 80rpx;
					line-height: 80rpx;
					padding: 0 24rpx;
					font-size: 30rpx;
					color: #333;
				}
				
				.uni-date__icon-clear {
					margin-right: 8rpx;
					color: #999;
					font-size: 32rpx;
				}
				
				.uni-date-editor--x__icon-calendar {
					margin-right: 8rpx;
					color: #999;
				}
				
				&:focus-within {
					border-color: #2979ff;
				}
			}
			
			.uni-date__x-input {
				height: 80rpx;
				line-height: 80rpx;
				padding: 0 24rpx;
				font-size: 30rpx;
				color: #333;
				background-color: transparent;
			}
			
			.uni-date-calendar--time-start {
				.uni-date-calendar--time-date {
					color: #333;
					border-radius: 4rpx;
					
					&.uni-date-calendar--time-date-active {
						background-color: #2979ff;
						color: #fff;
					}
				}
			}
		}
		
		:deep(.uni-datetime-picker) {
			width: 100%;
			
			.uni-datetime-picker-timebox {
				width: 100%;
				height: 80rpx;
				border: 1rpx solid #ddd;
				border-radius: 8rpx;
				display: flex;
				align-items: center;
				background-color: #fff;
				transition: border-color 0.3s ease;
				
				.uni-datetime-picker-time {
					line-height: 80rpx;
					padding: 0 24rpx;
					font-size: 30rpx;
					color: #333;
				}
				
				&:focus-within {
					border-color: #2979ff;
				}
			}
		}
		
		.quick-categories {
			display: flex;
			flex-wrap: wrap;
			margin: 0 -10rpx;
			margin-bottom: 30rpx;
			
			.category-item {
				margin: 10rpx;
				padding: 12rpx 24rpx;
				background: #f5f5f5;
				border-radius: 30rpx;
				font-size: 28rpx;
				color: #666;
				transition: all 0.3s ease;
				
				&.active {
					background: #2979ff;
					color: #fff;
				}
				
				&:active {
					opacity: 0.8;
				}
			}
		}
		
		:deep(.uni-select--mask) {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0,0,0,0.4);
			z-index: 9998;
		}
	}
	
	.modal-footer {
		padding: 30rpx;
		border-top: 1rpx solid #f5f5f5;
		display: flex;
		justify-content: flex-end;
		
		button {
			margin-left: 20rpx;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 32rpx;
			padding: 0 60rpx;
			border-radius: 8rpx;
			transition: opacity 0.3s ease;
			
			&:active {
				opacity: 0.8;
			}
			
			&.cancel-btn {
				background: none;
				border: 1rpx solid #ddd;
				color: #666;
			}
			
			&.confirm-btn {
				background: #2979ff;
				color: #fff;
			}
			
			&::after {
				border: none;
			}
		}
	}
}

@keyframes modalShow {
	from {
		opacity: 0;
		transform: scale(0.9);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

@keyframes formItemShow {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.picker-popup {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	max-height: 80vh;
	overflow: hidden;
	transform: translateY(0);
	transition: transform 0.3s ease;
	
	.picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
		background-color: #fff;
		
		.picker-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.close-btn {
			padding: 10rpx;
			color: #999;
			font-size: 40rpx;
			
			&:active {
				opacity: 0.7;
			}
		}
	}
	
	.picker-body {
		max-height: calc(80vh - 180rpx);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding-bottom: env(safe-area-inset-bottom);
		
		.picker-item {
			padding: 30rpx;
			font-size: 30rpx;
			color: #333;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1rpx solid #f5f5f5;
			background-color: #fff;
			transition: background-color 0.3s ease;
			
			&:active {
				background-color: #f5f5f5;
			}
			
			&.active {
				color: #2979ff;
				
				.iconfont {
					color: #2979ff;
					visibility: visible;
				}
			}
			
			.iconfont {
				visibility: hidden;
				font-size: 40rpx;
			}
		}
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
	
	.account-list .account-item {
		border-bottom-color: #333;
		
		&:active {
			background: #333;
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
			background: #333;
		}
	}
	
	.transaction-list .transaction-item {
		border-bottom-color: #333;
		
		&:active {
			background: #333;
		}
		
		.transaction-info {
			.transaction-category {
				color: #fff;
			}
		}
	}
	
	.tab-bar {
		background-color: #2c2c2c;
		box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.2);
	}
	
	.modal-content {
		background-color: #2c2c2c;
		
		.modal-header {
			border-bottom-color: #333;
			
			.modal-title {
				color: #fff;
			}
		}
		
		.modal-body {
			:deep(.uni-forms-item) {
				.uni-forms-item__label {
					color: #999;
				}
			}
			
			:deep(.uni-easyinput__content),
			:deep(.uni-data-select),
			:deep(.uni-date) {
				background-color: #1a1a1a;
				border-color: #333;
				
				.uni-easyinput__content-input,
				.uni-data-select__input-text,
				.uni-date-editor--x {
					color: #fff;
				}
				
				&:focus-within {
					border-color: #2979ff;
				}
			}
			
			.quick-categories {
				.category-item {
					background: #333;
					color: #999;
					
					&.active {
						background: #2979ff;
						color: #fff;
					}
				}
			}
			
			:deep(.uni-date) {
				.uni-date-editor {
					background-color: #1a1a1a;
					border-color: #333;
					
					&--x {
						color: #fff;
					}
					
					.uni-date__icon-clear,
					.uni-date-editor--x__icon-calendar {
						color: #666;
					}
				}
				
				.uni-date__x-input {
					color: #fff;
				}
				
				.uni-date-calendar--time-start {
					.uni-date-calendar--time-date {
						color: #fff;
						
						&.uni-date-calendar--time-date-active {
							background-color: #2979ff;
						}
					}
				}
			}
			
			:deep(.uni-datetime-picker) {
				.uni-datetime-picker-timebox {
					background-color: #1a1a1a;
					border-color: #333;
					
					.uni-datetime-picker-time {
						color: #fff;
					}
				}
			}
		}
		
		.modal-footer {
			border-top-color: #333;
			
			.cancel-btn {
				border-color: #333;
				color: #999;
			}
		}
		
		:deep(.uni-data-select) {
			background-color: #1a1a1a;
			border-color: #333;
			
			.uni-data-select__input-text {
				color: #fff;
			}
			
			.uni-data-select__input-placeholder {
				color: #666;
			}
			
			.uni-select__selector-wrap {
				.uni-select__selector {
					background-color: #2c2c2c;
					box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
					
					.uni-select__selector-item {
						color: #fff;
						border-bottom-color: #333;
						
						&:active {
							background-color: #333;
						}
						
						&.active {
							color: #2979ff;
							background-color: #1a1a1a;
						}
					}
				}
			}
			
			.uni-select__input-arrow {
				color: #666;
			}
		}
		
		:deep(.uni-select--mask) {
			background-color: rgba(0,0,0,0.6);
		}
	}
	
	.picker-popup {
		background-color: #2c2c2c;
		
		.picker-header {
			background-color: #2c2c2c;
			border-bottom-color: #333;
			
			.picker-title {
				color: #fff;
			}
			
			.close-btn {
				color: #666;
			}
		}
		
		.picker-body {
			.picker-item {
				background-color: #2c2c2c;
				color: #fff;
				border-bottom-color: #333;
				
				&:active {
					background-color: #333;
				}
				
				&.active {
					color: #2979ff;
				}
			}
		}
	}
}
</style> 