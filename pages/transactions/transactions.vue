<template>
	<view class="container">
		<!-- 筛选栏 -->
		<view class="filter-bar">
			<view class="filter-item" @click="showDatePicker">
				<text>{{dateRange.label}}</text>
				<text class="iconfont icon-calendar"></text>
			</view>
			<view class="filter-item" @click="showTypeFilter">
				<text>{{selectedType.label}}</text>
				<text class="iconfont icon-arrow-down"></text>
			</view>
			<view class="filter-item" @click="showCategoryFilter">
				<text>{{selectedCategory.label}}</text>
				<text class="iconfont icon-arrow-down"></text>
			</view>
		</view>
		
		<!-- 交易列表 -->
		<scroll-view 
			class="transaction-list" 
			scroll-y 
			@scrolltolower="loadMore"
			:style="{ height: scrollHeight + 'px' }"
		>
			<view class="transaction-group" v-for="group in transactionGroups" :key="group.date">
				<view class="group-header">
					<text class="date">{{group.date}}</text>
					<view class="summary">
						<text class="income" v-if="group.income > 0">收入: {{group.income}}</text>
						<text class="expense" v-if="group.expense > 0">支出: {{group.expense}}</text>
					</view>
				</view>
				
				<view class="transaction-item" 
					v-for="transaction in group.items" 
					:key="transaction.id"
					@click="handleEdit(transaction)"
				>
					<view class="transaction-info">
						<text class="category">{{transaction.category.name}}</text>
						<text class="account">{{transaction.account.name}}</text>
						<text class="remark" v-if="transaction.remark">{{transaction.remark}}</text>
					</view>
					<text :class="['amount', transaction.type === 1 ? 'income' : 'expense']">
						{{transaction.type === 1 ? '+' : '-'}}{{transaction.amount}}
					</text>
				</view>
			</view>
			
			<uni-load-more :status="loadMoreStatus" />
		</scroll-view>
		
		<!-- 添加交易按钮 -->
		<view class="add-btn" @click="showTransactionModal('add')">
			<text class="iconfont icon-add"></text>
			<text>记一笔</text>
		</view>
		
		<!-- 交易表单弹窗 -->
		<uni-popup ref="popup" type="center">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">{{isEdit ? '编辑交易' : '记一笔'}}</text>
					<text class="close-btn" @click="hideTransactionModal">×</text>
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
							<uni-data-select
								v-model="formData.category_id"
								:localdata="categories"
								placeholder="请选择分类"
							/>
						</uni-forms-item>
						
						<uni-forms-item name="account_id">
							<uni-data-select
								v-model="formData.account_id"
								:localdata="accounts"
								placeholder="请选择账户"
							/>
						</uni-forms-item>
						
						<uni-forms-item name="date">
							<uni-datetime-picker
								v-model="formData.date"
								type="date"
								:clear-icon="false"
							/>
						</uni-forms-item>
						
						<uni-forms-item name="remark">
							<uni-easyinput
								v-model="formData.remark"
								type="textarea"
								placeholder="请输入备注"
							/>
						</uni-forms-item>
					</uni-forms>
				</view>
				
				<view class="modal-footer">
					<button class="cancel-btn" @click="hideTransactionModal">取消</button>
					<button class="confirm-btn" type="primary" @click="handleSubmit">确定</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 日期选择弹窗 -->
		<uni-popup ref="datePicker" type="bottom">
			<view class="picker-content">
				<view class="picker-header">
					<text @click="hideDatePicker">取消</text>
					<text>选择日期范围</text>
					<text @click="confirmDateRange">确定</text>
				</view>
				<view class="date-options">
					<view 
						class="date-option" 
						v-for="option in dateOptions" 
						:key="option.value"
						:class="{ active: dateRange.value === option.value }"
						@click="selectDateRange(option)"
					>
						{{option.label}}
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 数据
const transactions = ref([
	{ 
		id: 1, 
		type: 1,
		amount: '8,000.00',
		category: { id: 1, name: '工资收入' },
		account: { id: 1, name: '工商银行' },
		date: '2024-02-22',
		remark: '2月工资'
	},
	{ 
		id: 2, 
		type: 0,
		amount: '1,200.00',
		category: { id: 2, name: '购物支出' },
		account: { id: 2, name: '支付宝' },
		date: '2024-02-21',
		remark: '超市购物'
	},
	{ 
		id: 3, 
		type: 1,
		amount: '500.00',
		category: { id: 3, name: '理财收益' },
		account: { id: 1, name: '工商银行' },
		date: '2024-02-20'
	},
	{ 
		id: 4, 
		type: 0,
		amount: '300.00',
		category: { id: 4, name: '日常开销' },
		account: { id: 3, name: '微信钱包' },
		date: '2024-02-19',
		remark: '午餐'
	}
])
const categories = ref([
	{ value: 1, text: '工资收入' },
	{ value: 2, text: '购物支出' },
	{ value: 3, text: '理财收益' },
	{ value: 4, text: '日常开销' },
	{ value: 5, text: '交通出行' },
	{ value: 6, text: '餐饮美食' }
])
const accounts = ref([
	{ value: 1, text: '工商银行' },
	{ value: 2, text: '支付宝' },
	{ value: 3, text: '微信钱包' },
	{ value: 4, text: '现金账户' }
])
const popup = ref(null)
const datePicker = ref(null)
const form = ref(null)
const isEdit = ref(false)
const currentTransaction = ref(null)
const page = ref(1)
const loadMoreStatus = ref('noMore')
const scrollHeight = ref(0)

// 表单数据
const formData = reactive({
	type: 0,
	amount: '',
	category_id: '',
	account_id: '',
	date: new Date().toISOString().split('T')[0],
	remark: ''
})

// 筛选条件
const dateRange = ref({
	value: 'month',
	label: '本月',
	start: '',
	end: ''
})

const selectedType = ref({
	value: 'all',
	label: '全部类型'
})

const selectedCategory = ref({
	value: 'all',
	label: '全部分类'
})

// 日期选项
const dateOptions = [
	{ value: 'today', label: '今天' },
	{ value: 'week', label: '本周' },
	{ value: 'month', label: '本月' },
	{ value: 'year', label: '今年' }
]

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

// 计算属性：按日期分组的交易记录
const transactionGroups = computed(() => {
	const groups = {}
	transactions.value.forEach(transaction => {
		const date = transaction.date
		if (!groups[date]) {
			groups[date] = {
				date,
				income: 0,
				expense: 0,
				items: []
			}
		}
		groups[date].items.push(transaction)
		if (transaction.type === 1) {
			groups[date].income += parseFloat(transaction.amount.replace(',', ''))
		} else {
			groups[date].expense += parseFloat(transaction.amount.replace(',', ''))
		}
	})
	return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 显示交易弹窗
const showTransactionModal = (type, transaction = null) => {
	isEdit.value = type === 'edit'
	if (isEdit.value && transaction) {
		currentTransaction.value = transaction
		Object.assign(formData, {
			type: transaction.type,
			amount: transaction.amount,
			category_id: transaction.category.id,
			account_id: transaction.account.id,
			date: transaction.date,
			remark: transaction.remark || ''
		})
	} else {
		currentTransaction.value = null
		Object.assign(formData, {
			type: 0,
			amount: '',
			category_id: '',
			account_id: '',
			date: new Date().toISOString().split('T')[0],
			remark: ''
		})
	}
	popup.value.open()
}

// 隐藏交易弹窗
const hideTransactionModal = () => {
	popup.value.close()
}

// 处理表单提交
const handleSubmit = async () => {
	try {
		const valid = await form.value.validate()
		if (valid) {
			if (isEdit.value) {
				// 模拟编辑交易
				const index = transactions.value.findIndex(item => item.id === currentTransaction.value.id)
				if (index !== -1) {
					transactions.value[index] = {
						...transactions.value[index],
						type: formData.type,
						amount: formData.amount,
						category: {
							id: formData.category_id,
							name: categories.value.find(item => item.value === formData.category_id)?.text
						},
						account: {
							id: formData.account_id,
							name: accounts.value.find(item => item.value === formData.account_id)?.text
						},
						date: formData.date,
						remark: formData.remark
					}
				}
				uni.showToast({
					title: '更新成功',
					icon: 'success'
				})
			} else {
				// 模拟添加交易
				transactions.value.unshift({
					id: Date.now(),
					type: formData.type,
					amount: formData.amount,
					category: {
						id: formData.category_id,
						name: categories.value.find(item => item.value === formData.category_id)?.text
					},
					account: {
						id: formData.account_id,
						name: accounts.value.find(item => item.value === formData.account_id)?.text
					},
					date: formData.date,
					remark: formData.remark
				})
				uni.showToast({
					title: '添加成功',
					icon: 'success'
				})
			}
			
			hideTransactionModal()
		}
	} catch (error) {
		uni.showToast({
			title: error.message || '操作失败',
			icon: 'none'
		})
	}
}

// 编辑交易
const handleEdit = (transaction) => {
	showTransactionModal('edit', transaction)
}

// 处理类型切换
const handleTypeChange = (e) => {
	formData.type = e.currentIndex
}

// 显示日期选择器
const showDatePicker = () => {
	datePicker.value.open()
}

// 隐藏日期选择器
const hideDatePicker = () => {
	datePicker.value.close()
}

// 选择日期范围
const selectDateRange = (option) => {
	dateRange.value = option
}

// 确认日期范围
const confirmDateRange = () => {
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	
	switch (dateRange.value.value) {
		case 'today':
			dateRange.value.start = today.toISOString().split('T')[0]
			dateRange.value.end = today.toISOString().split('T')[0]
			break
		case 'week':
			const weekStart = new Date(today)
			weekStart.setDate(today.getDate() - today.getDay())
			dateRange.value.start = weekStart.toISOString().split('T')[0]
			dateRange.value.end = today.toISOString().split('T')[0]
			break
		case 'month':
			const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
			dateRange.value.start = monthStart.toISOString().split('T')[0]
			dateRange.value.end = today.toISOString().split('T')[0]
			break
		case 'year':
			const yearStart = new Date(today.getFullYear(), 0, 1)
			dateRange.value.start = yearStart.toISOString().split('T')[0]
			dateRange.value.end = today.toISOString().split('T')[0]
			break
	}
	
	hideDatePicker()
	// 模拟筛选,实际应该调用API
}

// 加载更多
const loadMore = () => {
	// 模拟数据已全部加载
}

// 初始化
onMounted(() => {
	// 设置滚动区域高度
	const systemInfo = uni.getSystemInfoSync()
	scrollHeight.value = systemInfo.windowHeight - 50 // 减去筛选栏高度
	
	// 初始化日期范围为本月
	const now = new Date()
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
	dateRange.value.start = monthStart.toISOString().split('T')[0]
	dateRange.value.end = now.toISOString().split('T')[0]
})
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.filter-bar {
	height: 50px;
	background-color: #fff;
	display: flex;
	align-items: center;
	padding: 0 15px;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	
	.filter-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		color: #666;
		
		.iconfont {
			margin-left: 5px;
			font-size: 12px;
		}
	}
}

.transaction-list {
	padding: 15px;
	padding-top: 65px;
	
	.transaction-group {
		margin-bottom: 20px;
		
		.group-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;
			
			.date {
				font-size: 14px;
				color: #666;
			}
			
			.summary {
				font-size: 12px;
				
				.income {
					color: #52c41a;
					margin-right: 10px;
				}
				
				.expense {
					color: #ff4d4f;
				}
			}
		}
		
		.transaction-item {
			background-color: #fff;
			border-radius: 8px;
			padding: 15px;
			margin-bottom: 10px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			.transaction-info {
				.category {
					font-size: 16px;
					color: #333;
					margin-bottom: 5px;
				}
				
				.account {
					font-size: 12px;
					color: #999;
				}
				
				.remark {
					font-size: 12px;
					color: #666;
					margin-top: 5px;
				}
			}
			
			.amount {
				font-size: 16px;
				font-weight: bold;
				
				&.income {
					color: #52c41a;
				}
				
				&.expense {
					color: #ff4d4f;
				}
			}
		}
	}
}

.add-btn {
	position: fixed;
	bottom: 30px;
	left: 50%;
	transform: translateX(-50%);
	background-color: #2979ff;
	color: #fff;
	height: 44px;
	line-height: 44px;
	padding: 0 30px;
	border-radius: 22px;
	display: flex;
	align-items: center;
	box-shadow: 0 4px 12px rgba(41, 121, 255, 0.4);
	
	.iconfont {
		font-size: 20px;
		margin-right: 5px;
	}
	
	text {
		font-size: 16px;
	}
}

.modal-content {
	background-color: #fff;
	border-radius: 8px;
	width: 300px;
	
	.modal-header {
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.modal-title {
			font-size: 18px;
			font-weight: bold;
			color: #333;
		}
		
		.close-btn {
			font-size: 24px;
			color: #999;
			padding: 0 10px;
		}
	}
	
	.modal-body {
		padding: 15px;
	}
	
	.modal-footer {
		padding: 15px;
		border-top: 1px solid #f5f5f5;
		display: flex;
		justify-content: flex-end;
		
		button {
			margin-left: 10px;
			
			&.cancel-btn {
				background: none;
				border: 1px solid #ddd;
				color: #666;
			}
			
			&::after {
				border: none;
			}
		}
	}
}

.picker-content {
	background-color: #fff;
	
	.picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #f5f5f5;
		
		text {
			font-size: 16px;
			
			&:first-child {
				color: #666;
			}
			
			&:last-child {
				color: #2979ff;
			}
		}
	}
	
	.date-options {
		padding: 15px;
		
		.date-option {
			height: 44px;
			line-height: 44px;
			text-align: center;
			font-size: 16px;
			color: #333;
			border-bottom: 1px solid #f5f5f5;
			
			&.active {
				color: #2979ff;
			}
			
			&:last-child {
				border-bottom: none;
			}
		}
	}
}
</style> 