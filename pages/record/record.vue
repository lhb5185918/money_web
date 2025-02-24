<template>
	<view class="record-container">
		<!-- 类型切换 -->
		<view class="type-switch">
			<view class="switch-item" :class="{ active: formData.type === 0 }" @click="handleTypeChange({ currentIndex: 0 })">
				<text class="iconfont icon-expense"></text>
				<text>支出</text>
			</view>
			<view class="switch-item" :class="{ active: formData.type === 1 }" @click="handleTypeChange({ currentIndex: 1 })">
				<text class="iconfont icon-income"></text>
				<text>收入</text>
			</view>
		</view>
		
		<!-- 金额输入 -->
		<view class="amount-input">
			<text class="currency">￥</text>
			<input 
				type="digit"
				v-model="formData.amount"
				placeholder="请输入金额"
				placeholder-class="placeholder"
			/>
		</view>
		
		<!-- 常用分类 -->
		<view class="quick-categories">
			<text class="section-title">常用分类</text>
			<view class="category-grid">
				<view 
					v-for="item in quickCategories" 
					:key="item.value"
					class="category-item"
					:class="{ active: formData.category_id === item.value }"
					@click="handleQuickCategorySelect(item)"
				>
					<text class="iconfont" :class="item.icon"></text>
					<text class="category-name">{{item.text}}</text>
				</view>
			</view>
		</view>
		
		<!-- 表单区域 -->
		<view class="form-section">
			<uni-forms ref="form" :modelValue="formData" :rules="rules">
				<uni-forms-item name="category_id">
					<view class="form-item" @click="showCategoryPicker">
						<text class="label">分类</text>
						<view class="value">
							<text :class="{ placeholder: !formData.category_id }">
								{{formData.category_id ? categories.find(item => item.value === formData.category_id)?.text : '请选择分类'}}
							</text>
							<text class="iconfont icon-arrow-right"></text>
						</view>
					</view>
				</uni-forms-item>
				
				<uni-forms-item name="account_id">
					<view class="form-item" @click="showAccountPicker">
						<text class="label">账户</text>
						<view class="value">
							<text :class="{ placeholder: !formData.account_id }">
								{{formData.account_id ? accounts.find(item => item.id === formData.account_id)?.name : '请选择账户'}}
							</text>
							<text class="iconfont icon-arrow-right"></text>
						</view>
					</view>
				</uni-forms-item>
				
				<uni-forms-item name="date">
					<view class="form-item">
						<text class="label">日期</text>
						<view class="value">
							<uni-datetime-picker
								v-model="formData.date"
								type="date"
								:clear-icon="false"
							/>
						</view>
					</view>
				</uni-forms-item>
			</uni-forms>
		</view>
		
		<!-- 保存按钮 -->
		<view class="button-group">
			<button class="save-btn" @click="handleSubmit">保存</button>
		</view>
		
		<!-- 分类选择弹窗 -->
		<uni-popup ref="categoryPicker" type="bottom" background-color="none" safe-area>
			<view class="picker-popup">
				<view class="picker-header">
					<text class="picker-title">选择分类</text>
					<text class="close-btn iconfont icon-close" @click="hideCategoryPicker"></text>
				</view>
				<view class="picker-body">
					<view 
						v-for="item in categories" 
						:key="item.value"
						class="picker-item"
						:class="{ active: formData.category_id === item.value }"
						@click="handleCategorySelect(item)"
					>
						<view class="picker-item-left">
							<text class="iconfont" :class="item.icon"></text>
							<text>{{item.text}}</text>
						</view>
						<text class="iconfont icon-check" v-if="formData.category_id === item.value"></text>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 账户选择弹窗 -->
		<uni-popup ref="accountPicker" type="bottom" background-color="none" safe-area>
			<view class="picker-popup">
				<view class="picker-header">
					<text class="picker-title">选择账户</text>
					<text class="close-btn iconfont icon-close" @click="hideAccountPicker"></text>
				</view>
				<view class="picker-body">
					<view 
						v-for="item in accounts" 
						:key="item.id"
						class="picker-item"
						:class="{ active: formData.account_id === item.id }"
						@click="handleAccountSelect(item)"
					>
						<view class="picker-item-left">
							<text class="iconfont" :class="{
								'icon-cash': item.type === '现金',
								'icon-bank': item.type === '银行卡',
								'icon-alipay': item.type === '支付宝',
								'icon-wechat': item.type === '微信'
							}"></text>
							<text>{{item.name}}</text>
						</view>
						<text class="iconfont icon-check" v-if="formData.account_id === item.id"></text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import request from '@/utils/request'

// 表单数据
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
	{ value: 1, text: '工资收入', icon: 'icon-salary' },
	{ value: 2, text: '购物支出', icon: 'icon-shopping' },
	{ value: 3, text: '理财收益', icon: 'icon-finance' },
	{ value: 4, text: '日常开销', icon: 'icon-daily' },
	{ value: 5, text: '交通出行', icon: 'icon-transport' },
	{ value: 6, text: '餐饮美食', icon: 'icon-food' },
	{ value: 7, text: '娱乐休闲', icon: 'icon-entertainment' },
	{ value: 8, text: '居家生活', icon: 'icon-home' },
	{ value: 9, text: '医疗健康', icon: 'icon-medical' },
	{ value: 10, text: '教育培训', icon: 'icon-education' }
])

// 常用分类
const quickCategories = computed(() => {
	return formData.type === 0 ? 
		categories.value.filter(item => [2, 4, 5, 6].includes(item.value)) :
		categories.value.filter(item => [1, 3].includes(item.value))
})

// 账户选项
const accounts = ref([
	{ id: 1, name: '现金账户', balance: '28,500.00', type: '现金' },
	{ id: 2, name: '工商银行', balance: '50,000.00', type: '银行卡' },
	{ id: 3, name: '支付宝', balance: '30,000.00', type: '支付宝' },
	{ id: 4, name: '微信钱包', balance: '20,000.00', type: '微信' }
])

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

// 处理类型切换
const handleTypeChange = (e) => {
	formData.type = e.currentIndex
	formData.category_id = '' // 重置分类
}

// 处理快速分类选择
const handleQuickCategorySelect = (item) => {
	formData.category_id = item.value
}

// 处理表单提交
const handleSubmit = async () => {
	try {
		// 表单验证
		const valid = await form.value.validate()
		if (!valid) return
		
		// 发送记账请求
		const result = await request.post('/api/transactions', {
			type: formData.type,
			amount: parseFloat(formData.amount),
			category_id: formData.category_id,
			account_id: formData.account_id,
			date: formData.date
		})
		
		if (result.data) {
			uni.showToast({
				title: '记账成功',
				icon: 'success'
			})
			
			// 返回上一页并刷新数据
			setTimeout(() => {
				const pages = getCurrentPages()
				const prevPage = pages[pages.length - 2]
				
				// 触发上一页的刷新方法
				if (prevPage && prevPage.$vm) {
					prevPage.$vm.refreshData && prevPage.$vm.refreshData()
				}
				
				uni.navigateBack()
			}, 1500)
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
</script>

<style lang="scss">
.record-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: env(safe-area-inset-bottom);
	
	.type-switch {
		display: flex;
		background: #fff;
		padding: 20rpx;
		
		.switch-item {
			flex: 1;
			height: 100rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #666;
			transition: all 0.3s ease;
			
			.iconfont {
				font-size: 48rpx;
				margin-bottom: 8rpx;
			}
			
			text:last-child {
				font-size: 28rpx;
			}
			
			&.active {
				color: #2979ff;
				
				&:first-child {
					color: #ff4d4f;
				}
			}
		}
	}
	
	.amount-input {
		background: #fff;
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;
		border-top: 1rpx solid #f5f5f5;
		
		.currency {
			font-size: 48rpx;
			color: #333;
			margin-right: 20rpx;
		}
		
		input {
			flex: 1;
			font-size: 48rpx;
			color: #333;
		}
		
		.placeholder {
			color: #999;
		}
	}
	
	.quick-categories {
		background: #fff;
		padding: 30rpx;
		margin-top: 20rpx;
		
		.section-title {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
		}
		
		.category-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 20rpx;
			
			.category-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 20rpx 0;
				border-radius: 12rpx;
				transition: all 0.3s ease;
				
				.iconfont {
					font-size: 48rpx;
					color: #666;
					margin-bottom: 8rpx;
				}
				
				.category-name {
					font-size: 24rpx;
					color: #666;
				}
				
				&.active {
					background: #f0f7ff;
					
					.iconfont, .category-name {
						color: #2979ff;
					}
					
					&:first-child {
						background: #fff1f0;
						
						.iconfont, .category-name {
							color: #ff4d4f;
						}
					}
				}
			}
		}
	}
	
	.form-section {
		background: #fff;
		margin-top: 20rpx;
		padding: 0 30rpx;
		
		.form-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 100rpx;
			border-bottom: 1rpx solid #f5f5f5;
			
			&:last-child {
				border-bottom: none;
			}
			
			.label {
				font-size: 30rpx;
				color: #333;
			}
			
			.value {
				display: flex;
				align-items: center;
				
				text {
					font-size: 30rpx;
					color: #333;
					
					&.placeholder {
						color: #999;
					}
				}
				
				.iconfont {
					font-size: 32rpx;
					color: #999;
					margin-left: 10rpx;
				}
				
				:deep(.uni-date) {
					.uni-date-editor {
						border: none;
						
						.uni-date-editor--x {
							padding: 0;
						}
					}
				}
			}
		}
	}
	
	.button-group {
		padding: 40rpx 30rpx;
		
		.save-btn {
			width: 100%;
			height: 90rpx;
			line-height: 90rpx;
			background: #2979ff;
			color: #fff;
			font-size: 32rpx;
			border-radius: 45rpx;
			transition: opacity 0.3s ease;
			
			&:active {
				opacity: 0.8;
			}
			
			&::after {
				border: none;
			}
		}
	}
}

.picker-popup {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
	
	.picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
		
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
		max-height: 60vh;
		overflow-y: auto;
		
		.picker-item {
			padding: 30rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1rpx solid #f5f5f5;
			
			.picker-item-left {
				display: flex;
				align-items: center;
				
				.iconfont {
					font-size: 40rpx;
					color: #666;
					margin-right: 20rpx;
				}
				
				text {
					font-size: 30rpx;
					color: #333;
				}
			}
			
			&:active {
				background-color: #f5f5f5;
			}
			
			&.active {
				.picker-item-left {
					.iconfont, text {
						color: #2979ff;
					}
				}
				
				.icon-check {
					color: #2979ff;
					visibility: visible;
				}
			}
			
			.icon-check {
				visibility: hidden;
				font-size: 40rpx;
			}
		}
	}
}

// 暗黑模式支持
@media (prefers-color-scheme: dark) {
	.record-container {
		background-color: #1a1a1a;
		
		.type-switch {
			background: #2c2c2c;
			
			.switch-item {
				color: #999;
			}
		}
		
		.amount-input {
			background: #2c2c2c;
			border-top-color: #333;
			
			.currency {
				color: #fff;
			}
			
			input {
				color: #fff;
			}
			
			.placeholder {
				color: #666;
			}
		}
		
		.quick-categories {
			background: #2c2c2c;
			
			.section-title {
				color: #999;
			}
			
			.category-grid {
				.category-item {
					.iconfont {
						color: #999;
					}
					
					.category-name {
						color: #999;
					}
					
					&.active {
						background: #1a1a1a;
					}
				}
			}
		}
		
		.form-section {
			background: #2c2c2c;
			
			.form-item {
				border-bottom-color: #333;
				
				.label {
					color: #fff;
				}
				
				.value {
					text {
						color: #fff;
						
						&.placeholder {
							color: #666;
						}
					}
					
					.iconfont {
						color: #666;
					}
				}
			}
		}
	}
	
	.picker-popup {
		background-color: #2c2c2c;
		
		.picker-header {
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
				border-bottom-color: #333;
				
				.picker-item-left {
					.iconfont {
						color: #999;
					}
					
					text {
						color: #fff;
					}
				}
				
				&:active {
					background-color: #333;
				}
			}
		}
	}
}
</style> 