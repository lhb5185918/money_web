<template>
	<view class="container">
		<!-- 快速记账选项 -->
		<view class="quick-options">
			<scroll-view scroll-x="true" class="quick-scroll">
				<view class="quick-item" v-for="(item, index) in quickOptions" :key="index"
					@click="handleQuickOption(item)">
					<view class="icon-wrapper" :style="{ backgroundColor: item.color }">
						<uni-icons custom-prefix="custom-icon" :type="item.icon" size="24" color="#FFFFFF"></uni-icons>
					</view>
					<text class="quick-text">{{ item.text }}</text>
				</view>
			</scroll-view>
		</view>

		<uni-forms ref="form" :modelValue="formData" :rules="rules">
			<!-- 类型选择 -->
			<uni-forms-item name="type" label="类型">
				<uni-segmented-control
					:current="formData.type"
					:values="['支出', '收入']"
					@clickItem="onTypeChange"
					styleType="button"
					activeColor="#007AFF"
				/>
			</uni-forms-item>
			
			<!-- 金额输入 -->
			<uni-forms-item name="amount" label="金额">
				<uni-easyinput
					v-model="formData.amount"
					type="number"
					placeholder="请输入金额"
					@input="onAmountInput"
				/>
			</uni-forms-item>

			<!-- 智能分类建议 -->
			<view class="smart-suggestions" v-if="suggestions.length > 0">
				<text class="suggestion-title">猜你想选</text>
				<view class="suggestion-list">
					<view class="suggestion-item" v-for="(item, index) in suggestions" :key="index"
						@click="applySuggestion(item)">
						<uni-icons :type="item.icon" size="16" :color="item.color"></uni-icons>
						<text class="suggestion-text">{{ item.text }}</text>
					</view>
				</view>
			</view>
			
			<!-- 分类选择 -->
			<uni-forms-item name="category" label="分类">
				<uni-data-select
					v-model="formData.category"
					:localdata="categoryOptions"
					placeholder="请选择分类"
				/>
			</uni-forms-item>

			<!-- 消费类型选择 -->
			<uni-forms-item name="paymentType" label="消费类型">
				<uni-data-select
					v-model="formData.paymentType"
					:localdata="paymentTypeOptions"
					placeholder="请选择消费类型"
				/>
			</uni-forms-item>
			
			<!-- 日期选择 -->
			<uni-forms-item name="date" label="日期">
				<uni-datetime-picker
					v-model="formData.date"
					type="date"
					:clearIcon="false"
				/>
			</uni-forms-item>
			
			<!-- 备注输入 -->
			<uni-forms-item name="remark" label="备注">
				<uni-easyinput
					v-model="formData.remark"
					type="textarea"
					placeholder="请输入备注信息"
				/>
			</uni-forms-item>
		</uni-forms>
		
		<!-- 提交按钮 -->
		<button class="submit-btn" type="primary" @click="handleSubmit">保存</button>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const form = ref(null)
const formData = reactive({
	type: 0, // 0: 支出, 1: 收入
	amount: '',
	category: '',
	paymentType: '',
	date: new Date().toISOString().split('T')[0],
	remark: ''
})

// 快速记账选项
const quickOptions = [
	{ text: '早餐', icon: 'shop-filled', color: '#FF9800', amount: 15, category: 1, paymentType: 1 },
	{ text: '午餐', icon: 'shop-filled', color: '#2196F3', amount: 25, category: 1, paymentType: 1 },
	{ text: '晚餐', icon: 'shop-filled', color: '#4CAF50', amount: 30, category: 1, paymentType: 1 },
	{ text: '打车', icon: 'car-filled', color: '#9C27B0', amount: 20, category: 2, paymentType: 1 },
	{ text: '地铁', icon: 'car-filled', color: '#607D8B', amount: 4, category: 2, paymentType: 1 }
]

// 智能建议
const suggestions = ref([])
const recentCategories = [
	{ text: '餐饮', icon: 'shop', color: '#FF9800', category: 1, paymentType: 1 },
	{ text: '交通', icon: 'car', color: '#2196F3', category: 2, paymentType: 1 },
	{ text: '购物', icon: 'cart', color: '#4CAF50', category: 3, paymentType: 2 }
]

const rules = {
	amount: {
		rules: [{
			required: true,
			errorMessage: '请输入金额'
		}]
	},
	category: {
		rules: [{
			required: true,
			errorMessage: '请选择分类'
		}]
	},
	paymentType: {
		rules: [{
			required: true,
			errorMessage: '请选择消费类型'
		}]
	},
	date: {
		rules: [{
			required: true,
			errorMessage: '请选择日期'
		}]
	}
}

const categoryOptions = ref([
	{ value: 1, text: '餐饮' },
	{ value: 2, text: '交通' },
	{ value: 3, text: '购物' },
	{ value: 4, text: '娱乐' },
	{ value: 5, text: '居住' },
	{ value: 6, text: '工资' },
	{ value: 7, text: '理财收益' },
	{ value: 8, text: '其他收入' }
])

const paymentTypeOptions = ref([
	{ value: 1, text: '微信' },
	{ value: 2, text: '支付宝' },
	{ value: 3, text: '公积金' },
	{ value: 4, text: '工商银行' },
	{ value: 5, text: '青岛银行' },
	{ value: 6, text: '中国银行' },
	{ value: 7, text: '浦发银行' },
	{ value: 8, text: '招商银行' },
	{ value: 9, text: '建设银行' }
])

const onTypeChange = (e) => {
	formData.type = e.currentIndex
	formData.category = '' // 重置分类选择
	suggestions.value = [] // 清空建议
}

const onAmountInput = (value) => {
	// 根据金额智能推荐分类
	if (value > 0) {
		if (value <= 50) {
			suggestions.value = recentCategories.filter(item => item.text === '餐饮')
		} else if (value <= 100) {
			suggestions.value = recentCategories.filter(item => ['餐饮', '交通'].includes(item.text))
		} else {
			suggestions.value = recentCategories.filter(item => item.text === '购物')
		}
	} else {
		suggestions.value = []
	}
}

const handleQuickOption = (option) => {
	formData.amount = option.amount.toString()
	formData.category = option.category
	formData.paymentType = option.paymentType
	suggestions.value = []
}

const applySuggestion = (suggestion) => {
	formData.category = suggestion.category
	formData.paymentType = suggestion.paymentType
}

const handleSubmit = async () => {
	try {
		const valid = await form.value.validate()
		if (valid) {
			// TODO: 保存记录到数据库
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		}
	} catch (e) {
		console.error(e)
	}
}
</script>

<style lang="scss">
.container {
	padding: 20px;
	
	.quick-options {
		margin: -10px -20px 20px;
		padding: 15px 20px;
		background-color: #fff;
		
		.quick-scroll {
			white-space: nowrap;
			
			.quick-item {
				display: inline-flex;
				flex-direction: column;
				align-items: center;
				margin-right: 25px;
				padding: 5px;
				
				&:last-child {
					margin-right: 5px;
				}
				
				.icon-wrapper {
					width: 48px;
					height: 48px;
					border-radius: 24px;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 8px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					
					:deep(.uni-icons) {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 24px;
						height: 24px;
					}
				}
				
				.quick-text {
					font-size: 13px;
					color: #333;
					white-space: nowrap;
				}
			}
		}
	}

	.smart-suggestions {
		margin: 10px 0 20px;
		
		.suggestion-title {
			font-size: 12px;
			color: #999;
			margin-bottom: 10px;
			display: block;
		}
		
		.suggestion-list {
			display: flex;
			flex-wrap: wrap;
			gap: 10px;
			
			.suggestion-item {
				display: flex;
				align-items: center;
				padding: 6px 12px;
				background-color: #f5f5f5;
				border-radius: 16px;
				
				.suggestion-text {
					font-size: 14px;
					color: #333;
					margin-left: 5px;
				}
			}
		}
	}
	
	:deep(.uni-forms-item) {
		margin-bottom: 20px;
		
		.uni-forms-item__label {
			font-size: 16px;
			color: #333;
		}
		
		.uni-easyinput__content,
		.uni-data-select {
			border: 1px solid #ddd;
			border-radius: 8px;
			
			.uni-easyinput__content-input {
				font-size: 16px;
			}
		}
	}
	
	.submit-btn {
		margin-top: 30px;
		width: 100%;
		height: 45px;
		line-height: 45px;
		border-radius: 8px;
		font-size: 16px;
	}
}
</style> 