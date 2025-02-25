<template>
	<view class="assets-container">
		<!-- 顶部导航 -->
		<view class="nav-bar">
			<text class="title"></text>
		</view>
		
		<!-- 账户列表 -->
		<view class="account-list">
			<view class="account-item" v-for="(account, index) in accounts" :key="account.id"
				:style="{ animationDelay: index * 0.1 + 's' }">
				<view class="account-icon">
					<text class="iconfont" :class="{
						'icon-cash': account.type === '现金',
						'icon-bank': account.type === '银行卡',
						'icon-alipay': account.type === '支付宝',
						'icon-wechat': account.type === '微信',
						'icon-fund': account.type === '公积金'
					}"></text>
				</view>
				<view class="account-info">
					<text class="account-name">{{account.name}}</text>
					<text class="account-balance">￥{{account.balance}}</text>
				</view>
				<text class="account-type" :class="account.type">{{account.type}}</text>
			</view>
		</view>
		
		<!-- 创建账户按钮 -->
		<view class="button-group">
			<button class="create-btn" @click="showCreateModal">
				<text class="iconfont icon-add"></text>
				<text>创建账户</text>
			</button>
		</view>
		
		<!-- 创建账户弹窗 -->
		<uni-popup ref="createModal" type="bottom" background-color="none" safe-area>
			<view class="create-popup">
				<view class="popup-header">
					<text class="popup-title">创建账户</text>
					<text class="close-btn iconfont icon-close" @click="hideCreateModal"></text>
				</view>
				
				<!-- 添加进度指示器 -->
				<view class="progress-bar">
					<view class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
						<text class="step-number">1</text>
						<text class="step-text">账户名称</text>
					</view>
					<view class="progress-line" :class="{ active: currentStep > 1 }"></view>
					<view class="progress-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
						<text class="step-number">2</text>
						<text class="step-text">账户类型</text>
					</view>
					<view class="progress-line" :class="{ active: currentStep > 2 }"></view>
					<view class="progress-step" :class="{ active: currentStep >= 3 }">
						<text class="step-number">3</text>
						<text class="step-text">初始余额</text>
					</view>
				</view>
				
				<view class="popup-body">
					<uni-forms ref="form" :model="formData" :rules="rules">
						<uni-forms-item name="name">
							<view class="form-item">
								<text class="label">账户名称</text>
								<input 
									type="text"
									v-model="formData.name"
									placeholder="请输入账户名称"
									placeholder-class="placeholder"
									@input="handleNameInput"
								/>
							</view>
						</uni-forms-item>
						
						<uni-forms-item name="type">
							<view class="form-item">
								<text class="label">账户类型</text>
								<view class="account-type-selector" @click="toggleTypeDropdown">
									<view class="selected-type" :class="{ placeholder: !formData.type }">
										<template v-if="formData.type">
											<text class="type-icon iconfont" :class="{
												'icon-cash': formData.type === '现金',
												'icon-bank': formData.type === '银行卡',
												'icon-alipay': formData.type === '支付宝',
												'icon-wechat': formData.type === '微信',
												'icon-fund': formData.type === '公积金'
											}"></text>
											<text>{{formData.type}}</text>
										</template>
										<template v-else>
											<text>请选择账户类型</text>
										</template>
										<text class="iconfont icon-arrow-down"></text>
									</view>
									
									<!-- 账户类型下拉菜单 -->
									<view class="type-dropdown" v-if="showTypeDropdown">
										<view 
											class="type-option"
											v-for="type in accountTypes"
											:key="type"
											@click.stop="selectAccountType(type)"
											:class="{ active: formData.type === type }"
										>
											<view class="type-icon-wrapper" :class="type.toLowerCase()">
												<text class="type-icon iconfont" :class="{
													'icon-cash': type === '现金',
													'icon-bank': type === '银行卡',
													'icon-alipay': type === '支付宝',
													'icon-wechat': type === '微信',
													'icon-fund': type === '公积金'
												}"></text>
											</view>
											<text>{{type}}</text>
											<text class="iconfont icon-check" v-if="formData.type === type"></text>
										</view>
									</view>
								</view>
							</view>
						</uni-forms-item>
						
						<uni-forms-item name="balance">
							<view class="form-item">
								<text class="label">初始余额</text>
								<view class="balance-input">
									<text class="currency">￥</text>
									<input 
										type="digit"
										v-model="formData.balance"
										placeholder="请输入初始余额"
										placeholder-class="placeholder"
										@input="handleBalanceInput"
									/>
								</view>
								<text class="formatted-balance">{{formattedBalance}}</text>
							</view>
						</uni-forms-item>
					</uni-forms>
					
					<button class="submit-btn" @click="handleSubmit">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

// 账户列表数据
const accounts = ref([])
const isLoading = ref(false)

// 账户类型选项
const accountTypes = ['现金', '银行卡', '支付宝', '微信', '公积金']
const typeIndex = ref(0)

// 表单数据
const form = ref(null)
const formData = reactive({
	name: '',
	type: '',
	balance: ''
})

// 表单验证规则
const rules = {
	name: {
		rules: [{
			required: true,
			errorMessage: '请输入账户名称'
		}]
	},
	type: {
		rules: [{
			required: true,
			errorMessage: '请选择账户类型'
		}]
	},
	balance: {
		rules: [{
			required: true,
			errorMessage: '请输入初始余额'
		}]
	}
}

// 弹窗引用
const createModal = ref(null)

// 添加新的响应式变量
const currentStep = ref(1)
const showTypeDropdown = ref(false)
const formattedBalance = ref('')

// 处理账户名称输入
const handleNameInput = () => {
	if (formData.name) {
		currentStep.value = 2
	}
}

// 切换类型下拉菜单
const toggleTypeDropdown = () => {
	showTypeDropdown.value = !showTypeDropdown.value
}

// 选择账户类型
const selectAccountType = (type) => {
	formData.type = type
	showTypeDropdown.value = false
	currentStep.value = 3
}

// 处理余额输入
const handleBalanceInput = (e) => {
	const value = e.detail.value.replace(/[^\d.]/g, '')
	if (value) {
		// 格式化金额
		const number = parseFloat(value)
		if (!isNaN(number)) {
			formattedBalance.value = `￥${number.toLocaleString('zh-CN', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}`
		}
	} else {
		formattedBalance.value = ''
	}
}

// 显示创建账户弹窗
const showCreateModal = () => {
	createModal.value.open()
}

// 隐藏创建账户弹窗
const hideCreateModal = () => {
	createModal.value.close()
	// 重置表单
	formData.name = ''
	formData.type = ''
	formData.balance = ''
	formattedBalance.value = ''
	currentStep.value = 1
	showTypeDropdown.value = false
}

// 获取账户列表
const refreshAccounts = async () => {
	if (isLoading.value) return
	
	try {
		isLoading.value = true
		const res = await request.get('/api/assets/accounts')
		if (res.data) {
			accounts.value = res.data
		}
	} catch (error) {
		console.log('【Assets】获取账户列表失败:', error)
		if (error.message === '请先登录' || error.message === '登录已过期') {
			// 已经在 request.js 中处理了跳转逻辑，这里不需要重复处理
			return
		}
		uni.showToast({
			title: error.message || '获取数据失败',
			icon: 'none'
		})
	} finally {
		isLoading.value = false
	}
}

// 处理表单提交
const handleSubmit = async () => {
	try {
		// 表单验证
		const valid = await form.value.validate()
		if (!valid) return
		
		const result = await request.post('/api/assets/accounts', {
			name: formData.name,
			type: formData.type,
			balance: parseFloat(formData.balance)
		})
		
		if (result.data) {
			uni.showToast({
				title: '创建成功',
				icon: 'success'
			})
			
			// 关闭弹窗
			hideCreateModal()
			
			// 延迟一下再刷新列表
			setTimeout(() => {
				refreshAccounts()
			}, 300)
		}
	} catch (error) {
		uni.showToast({
			title: error.message || '创建失败',
			icon: 'none'
		})
	}
}

// 初始化
onMounted(async () => {
	try {
		const userStore = useUserStore()
		console.log('【Assets】开始初始化页面')
		
		// 尝试最多3次初始化
		let retryCount = 0
		let isValid = false
		
		while (retryCount < 3 && !isValid) {
			try {
				isValid = await userStore.initState()
				console.log('【Assets】用户状态初始化结果:', isValid, '重试次数:', retryCount)
				
				if (isValid) {
					console.log('【Assets】用户状态有效，开始获取账户列表')
					await refreshAccounts()
					break
				} else {
					console.log('【Assets】用户未登录或token无效')
					retryCount++
					if (retryCount < 3) {
						console.log('【Assets】等待1秒后重试')
						await new Promise(resolve => setTimeout(resolve, 1000))
					}
				}
			} catch (error) {
				console.error('【Assets】初始化尝试失败:', error)
				retryCount++
				if (retryCount < 3) {
					console.log('【Assets】等待1秒后重试')
					await new Promise(resolve => setTimeout(resolve, 1000))
				}
			}
		}
		
		if (!isValid) {
			console.log('【Assets】多次尝试后仍未成功，执行登出操作')
			userStore.logout()
		}
	} catch (error) {
		console.error('【Assets】初始化过程发生错误:', error)
		const userStore = useUserStore()
		userStore.logout()
	}
})
</script>

<style lang="scss">
.assets-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #f0f7ff 0%, #f5f5f5 100%);
	padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
	position: relative;
	
	.nav-bar {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		padding: 30rpx;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(20px);
		box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.05);
		
		.title {
			flex: 1;
			text-align: center;
			font-size: 40rpx;
			font-weight: 700;
			color: #333;
			position: relative;
			display: inline-block;
			letter-spacing: 4rpx;
			text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
			
			&::after {
				content: '';
				position: absolute;
				bottom: -8rpx;
				left: 50%;
				transform: translateX(-50%);
				width: 80rpx;
				height: 8rpx;
				background: linear-gradient(to right, #2979ff, #1565c0);
				border-radius: 4rpx;
				box-shadow: 0 2rpx 8rpx rgba(41, 121, 255, 0.2);
			}
		}
	}
	
	.account-list {
		padding: 30rpx;
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
		
		.account-item {
			display: flex;
			align-items: center;
			padding: 40rpx;
			background: rgba(255, 255, 255, 0.98);
			border-radius: 30rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);
			animation: slideInRight 0.5s ease-out forwards;
			opacity: 0;
			transform: translateY(0);
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;
			
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
				opacity: 0;
				transition: opacity 0.3s ease;
			}
			
			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
				
				&::before {
					opacity: 1;
				}
			}
			
			.account-icon {
				width: 100rpx;
				height: 100rpx;
				background: #f0f7ff;
				border-radius: 25rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 30rpx;
				position: relative;
				overflow: hidden;
				
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
					border-radius: 25rpx;
				}
				
				.iconfont {
					font-size: 48rpx;
					position: relative;
					z-index: 1;
					
					&.icon-cash {
						color: #52c41a;
						background: linear-gradient(135deg, #52c41a, #389e0d);
						-webkit-background-clip: text;
						color: transparent;
					}
					
					&.icon-bank {
						color: #2979ff;
						background: linear-gradient(135deg, #2979ff, #1565c0);
						-webkit-background-clip: text;
						color: transparent;
					}
					
					&.icon-alipay {
						color: #1890ff;
						background: linear-gradient(135deg, #1890ff, #096dd9);
						-webkit-background-clip: text;
						color: transparent;
					}
					
					&.icon-wechat {
						color: #07c160;
						background: linear-gradient(135deg, #07c160, #059669);
						-webkit-background-clip: text;
						color: transparent;
					}
				}
			}
			
			.account-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				
				.account-name {
					font-size: 36rpx;
					color: #333;
					margin-bottom: 12rpx;
					font-weight: 600;
				}
				
				.account-balance {
					font-size: 32rpx;
					color: #666;
					font-family: 'DIN Alternate', sans-serif;
				}
			}
			
			.account-type {
				font-size: 26rpx;
				padding: 8rpx 24rpx;
				border-radius: 20rpx;
				font-weight: 500;
				box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
				
				&.现金 {
					background: #f6ffed;
					color: #52c41a;
				}
				
				&.银行卡 {
					background: #e6f7ff;
					color: #2979ff;
				}
				
				&.支付宝 {
					background: #e6f4ff;
					color: #1890ff;
				}
				
				&.微信 {
					background: #f6ffed;
					color: #07c160;
				}
				
				&.公积金 {
					background: #f0f7ff;
					color: #1890ff;
				}
			}
		}
	}
	
	.button-group {
		position: fixed;
		left: 0;
		right: 0;
		bottom: calc(100rpx + env(safe-area-inset-bottom));
		padding: 20rpx 30rpx;
		background: transparent;
		backdrop-filter: none;
		z-index: 99;
		box-shadow: none;
		
		.create-btn {
			width: 100%;
			height: 100rpx;
			background: linear-gradient(135deg, #2979ff, #1565c0);
			color: #fff;
			font-size: 36rpx;
			font-weight: 600;
			border-radius: 50rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s ease;
			box-shadow: 0 8rpx 32rpx rgba(41, 121, 255, 0.25);
			position: relative;
			overflow: hidden;
			
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
				opacity: 0;
				transition: opacity 0.3s ease;
			}
			
			.iconfont {
				font-size: 44rpx;
				margin-right: 12rpx;
				background: linear-gradient(135deg, #fff, rgba(255,255,255,0.9));
				-webkit-background-clip: text;
				color: transparent;
			}
			
			&:active {
				transform: scale(0.98);
				box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.2);
				
				&::before {
					opacity: 1;
				}
			}
			
			&::after {
				border: none;
			}
		}
	}
}

.create-popup {
	background-color: #fff;
	border-radius: 40rpx 40rpx 0 0;
	overflow: hidden;
	max-height: calc(90vh - 100rpx);
	display: flex;
	flex-direction: column;
	box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.1);
	
	.popup-header {
		padding: 40rpx 30rpx;
		border-bottom: 2rpx solid #f5f5f5;
		position: relative;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(20px);
		flex-shrink: 0;
		
		.popup-title {
			text-align: center;
			font-size: 40rpx;
			font-weight: 700;
			color: #333;
			letter-spacing: 4rpx;
			position: relative;
			display: inline-block;
			left: 50%;
			transform: translateX(-50%);
			
			&::after {
				content: '';
				position: absolute;
				bottom: -12rpx;
				left: 50%;
				transform: translateX(-50%);
				width: 80rpx;
				height: 8rpx;
				background: linear-gradient(to right, #2979ff, #1565c0);
				border-radius: 4rpx;
				box-shadow: 0 2rpx 8rpx rgba(41, 121, 255, 0.2);
			}
		}
	}
	
	.progress-bar {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 40rpx 60rpx;
		background: #fff;
		position: relative;
		
		.progress-step {
			display: flex;
			flex-direction: column;
			align-items: center;
			position: relative;
			z-index: 1;
			
			.step-number {
				width: 60rpx;
				height: 60rpx;
				border-radius: 30rpx;
				background: #f5f5f5;
				color: #999;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 28rpx;
				font-weight: 600;
				margin-bottom: 12rpx;
				transition: all 0.3s ease;
			}
			
			.step-text {
				font-size: 24rpx;
				color: #999;
				transition: all 0.3s ease;
			}
			
			&.active {
				.step-number {
					background: #e6f0ff;
					color: #2979ff;
				}
				
				.step-text {
					color: #2979ff;
					font-weight: 500;
				}
			}
			
			&.completed {
				.step-number {
					background: #2979ff;
					color: #fff;
				}
			}
		}
		
		.progress-line {
			flex: 1;
			height: 4rpx;
			background: #f5f5f5;
			margin: 0 20rpx;
			margin-bottom: 36rpx;
			position: relative;
			
			&.active {
				background: #2979ff;
			}
		}
	}
	
	.popup-body {
		flex: 1;
		overflow-y: auto;
		padding: 40rpx 30rpx;
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom) + 100rpx);
		background: #f8f9fa;
		position: relative;
		
		.form-item {
			margin-bottom: 40rpx;
			background: #fff;
			border-radius: 24rpx;
			padding: 40rpx;
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.05);

			.balance-input {
				display: flex;
				align-items: center;
				background: #f8f9fa;
				border-radius: 16rpx;
				padding: 20rpx 32rpx;
				margin-top: 20rpx;
				
				.currency {
					font-size: 32rpx;
					color: #333;
					margin-right: 8rpx;
					font-weight: 500;
				}
				
				input {
					flex: 1;
					font-size: 32rpx;
					color: #333;
					padding: 0;
					min-height: auto;
					height: 44rpx;
					line-height: 44rpx;
				}
			}
			
			.formatted-balance {
				display: block;
				font-size: 28rpx;
				color: #666;
				margin-top: 16rpx;
				font-family: 'DIN Alternate', sans-serif;
			}
			
			.label {
				display: block;
				font-size: 28rpx;
				color: #666;
				margin-bottom: 8rpx;
				font-weight: 500;
			}
		}

		.submit-btn {
			position: fixed;
			left: 30rpx;
			right: 30rpx;
			bottom: calc(140rpx + env(safe-area-inset-bottom));
			height: 100rpx;
			background: linear-gradient(135deg, #2979ff, #1565c0);
			color: #fff;
			font-size: 36rpx;
			font-weight: 600;
			border-radius: 50rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s ease;
			box-shadow: 0 8rpx 32rpx rgba(41, 121, 255, 0.25);
			z-index: 100;
			
			&::after {
				border: none;
			}
			
			&:active {
				transform: scale(0.98);
				box-shadow: 0 4rpx 16rpx rgba(41, 121, 255, 0.2);
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

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

// 暗黑模式
@media (prefers-color-scheme: dark) {
	.assets-container {
		background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
		
		.nav-bar {
			background: rgba(44, 44, 44, 0.98);
			box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.2);
			
			.title {
				color: #fff;
				text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
				
				&::after {
					background: linear-gradient(to right, #1565c0, #0d47a1);
					box-shadow: 0 2rpx 8rpx rgba(21, 101, 192, 0.3);
				}
			}
		}
		
		.account-list {
			.account-item {
				background: rgba(44, 44, 44, 0.98);
				box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
				
				.account-icon {
					background: rgba(255, 255, 255, 0.05);
					
					&::before {
						background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
					}
					
					.iconfont {
						opacity: 0.9;
					}
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
					background: rgba(255, 255, 255, 0.05);
					color: #999;
					box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
				}
				
				&:active {
					box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
				}
			}
		}
		
		.button-group {
			.create-btn {
				background: linear-gradient(135deg, #1565c0, #0d47a1);
				box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
				
				&:active {
					box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.25);
				}
			}
		}
	}
	
	.create-popup {
		background: #2c2c2c;
		box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.3);
		
		.popup-header {
			background: rgba(44, 44, 44, 0.98);
			border-bottom-color: rgba(255, 255, 255, 0.1);
			
			.popup-title {
				color: #fff;
				text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
				
				&::after {
					background: linear-gradient(to right, #1565c0, #0d47a1);
					box-shadow: 0 2rpx 8rpx rgba(21, 101, 192, 0.3);
				}
			}
		}
		
		.submit-btn {
			background: linear-gradient(135deg, #1565c0, #0d47a1);
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
			
			&:active {
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.25);
			}
		}
	}
}

.account-type-selector {
	position: relative;
	z-index: 10;
	width: 100%;
	
	.selected-type {
		display: flex;
		align-items: center;
		padding: 24rpx 32rpx;
		background: #f8f9fa;
		border-radius: 16rpx;
		border: 2rpx solid #e8e8e8;
		transition: all 0.3s ease;
		
		&:active {
			background: #f0f0f0;
		}
		
		.type-icon {
			font-size: 40rpx;
			margin-right: 20rpx;
			
			&.icon-cash { color: #52c41a; }
			&.icon-bank { color: #2979ff; }
			&.icon-alipay { color: #1890ff; }
			&.icon-wechat { color: #07c160; }
		}
		
		.icon-arrow-down {
			margin-left: auto;
			font-size: 32rpx;
			color: #999;
			transition: transform 0.3s ease;
		}
		
		&.placeholder {
			color: #999;
		}
	}
	
	.type-dropdown {
		position: fixed;
		left: 30rpx;
		right: 30rpx;
		top: 50%;
		transform: translateY(-50%);
		background: #fff;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
		z-index: 999;
		max-height: 60vh;
		overflow-y: auto;
		animation: slideDown 0.3s ease-out;
		
		.type-option {
			display: flex;
			align-items: center;
			padding: 32rpx;
			transition: all 0.3s ease;
			position: relative;
			
			&:not(:last-child) {
				border-bottom: 2rpx solid #f5f5f5;
			}
			
			.type-icon-wrapper {
				width: 80rpx;
				height: 80rpx;
				border-radius: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 24rpx;
				transition: all 0.3s ease;
				position: relative;
				overflow: hidden;
				
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
					opacity: 0;
					transition: opacity 0.3s ease;
				}
				
				&.现金 {
					background: #f6ffed;
					.type-icon { color: #52c41a; }
				}
				
				&.银行卡 {
					background: #e6f7ff;
					.type-icon { color: #2979ff; }
				}
				
				&.支付宝 {
					background: #e6f4ff;
					.type-icon { color: #1890ff; }
				}
				
				&.微信 {
					background: #f6ffed;
					.type-icon { color: #07c160; }
				}
				
				&.公积金 {
					background: #e6f7ff;
					.type-icon { 
						color: #1890ff;
						&.icon-fund {
							background: linear-gradient(135deg, #1890ff, #096dd9);
							-webkit-background-clip: text;
							color: transparent;
						}
					}
				}
				
				.type-icon {
					font-size: 44rpx;
					position: relative;
					z-index: 1;
				}
			}
			
			text {
				font-size: 32rpx;
				color: #333;
				flex: 1;
			}
			
			.icon-check {
				font-size: 44rpx;
				color: #2979ff;
				margin-left: 16rpx;
				opacity: 0;
				transform: scale(0.8);
				transition: all 0.3s ease;
			}
			
			&.active {
				background: #f0f7ff;
				
				.type-icon-wrapper {
					transform: scale(1.05);
					
					&::before {
						opacity: 1;
					}
				}
				
				text {
					color: #2979ff;
					font-weight: 500;
				}
				
				.icon-check {
					opacity: 1;
					transform: scale(1);
				}
			}
			
			&:active {
				background: #e6f0ff;
			}
		}
	}
}
</style> 