<template>
	<view class="container">
		<!-- 时间范围选择 -->
		<view class="date-picker">
			<picker mode="date" fields="month" :value="currentDate" @change="handleDateChange">
				<view class="picker-value">
					<text>{{currentDate}}</text>
					<text class="iconfont icon-calendar"></text>
				</view>
			</picker>
		</view>
		
		<!-- 收支概览 -->
		<view class="overview-card">
			<view class="overview-item">
				<text class="label">收入</text>
				<text class="amount income">{{overview.income.total}}</text>
			</view>
			<view class="divider"></view>
			<view class="overview-item">
				<text class="label">支出</text>
				<text class="amount expense">{{overview.expense.total}}</text>
			</view>
			<view class="divider"></view>
			<view class="overview-item">
				<text class="label">结余</text>
				<text class="amount" :class="overview.net_income >= 0 ? 'income' : 'expense'">
					{{overview.net_income}}
				</text>
			</view>
		</view>
		
		<!-- 收支趋势图 -->
		<view class="chart-card">
			<view class="card-header">
				<text class="title">收支趋势</text>
				<view class="legend">
					<view class="legend-item">
						<view class="dot income"></view>
						<text>收入</text>
					</view>
					<view class="legend-item">
						<view class="dot expense"></view>
						<text>支出</text>
					</view>
				</view>
			</view>
			<qiun-data-charts 
				type="line"
				:opts="lineOpts"
				:chartData="lineData"
			/>
		</view>
		
		<!-- 支出分类统计 -->
		<view class="chart-card">
			<view class="card-header">
				<text class="title">支出分类</text>
				<text class="total">总支出: {{overview.expense.total}}</text>
			</view>
			<qiun-data-charts 
				type="pie"
				:opts="pieOpts"
				:chartData="expensePieData"
			/>
			<view class="category-list">
				<view class="category-item" v-for="(category, index) in overview.expense.categories" :key="index">
					<view class="category-info">
						<view class="dot" :style="{ backgroundColor: pieColors[index % pieColors.length] }"></view>
						<text class="name">{{category.category.name}}</text>
					</view>
					<view class="category-amount">
						<text class="amount">{{category.amount}}</text>
						<text class="percent">{{(category.amount / overview.expense.total * 100).toFixed(1)}}%</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 收入分类统计 -->
		<view class="chart-card">
			<view class="card-header">
				<text class="title">收入分类</text>
				<text class="total">总收入: {{overview.income.total}}</text>
			</view>
			<qiun-data-charts 
				type="pie"
				:opts="pieOpts"
				:chartData="incomePieData"
			/>
			<view class="category-list">
				<view class="category-item" v-for="(category, index) in overview.income.categories" :key="index">
					<view class="category-info">
						<view class="dot" :style="{ backgroundColor: pieColors[index % pieColors.length] }"></view>
						<text class="name">{{category.category.name}}</text>
					</view>
					<view class="category-amount">
						<text class="amount">{{category.amount}}</text>
						<text class="percent">{{(category.amount / overview.income.total * 100).toFixed(1)}}%</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 数据
const currentDate = ref(new Date().toISOString().split('T')[0].substr(0, 7))
const overview = reactive({
	income: {
		total: '12,500.00',
		categories: [
			{
				category: { name: '工资收入' },
				amount: '8,000.00'
			},
			{
				category: { name: '理财收益' },
				amount: '4,500.00'
			}
		]
	},
	expense: {
		total: '8,300.00',
		categories: [
			{
				category: { name: '日常开销' },
				amount: '3,000.00'
			},
			{
				category: { name: '购物支出' },
				amount: '2,800.00'
			},
			{
				category: { name: '交通出行' },
				amount: '1,500.00'
			},
			{
				category: { name: '餐饮美食' },
				amount: '1,000.00'
			}
		]
	},
	net_income: '4,200.00'
})
const monthlyTrend = ref([
	{ month: '2023-09', income: '11000.00', expense: '7800.00' },
	{ month: '2023-10', income: '11500.00', expense: '8000.00' },
	{ month: '2023-11', income: '12000.00', expense: '8100.00' },
	{ month: '2023-12', income: '12000.00', expense: '8500.00' },
	{ month: '2024-01', income: '12200.00', expense: '8200.00' },
	{ month: '2024-02', income: '12500.00', expense: '8300.00' }
])

// 图表配置
const lineOpts = {
	color: ['#52c41a', '#ff4d4f'],
	padding: [15, 15, 0, 15],
	enableScroll: false,
	legend: false,
	xAxis: {
		disableGrid: true
	},
	yAxis: {
		gridType: 'dash',
		dashLength: 2
	},
	extra: {
		line: {
			type: 'straight',
			width: 2
		}
	}
}

const pieOpts = {
	padding: [15, 15, 15, 15],
	enableScroll: false,
	legend: false,
	extra: {
		pie: {
			activeRadius: 10,
			offsetAngle: 0,
			labelWidth: 15,
			border: false,
			linearType: 'none'
		}
	}
}

const pieColors = [
	'#1890ff',
	'#2fc25b',
	'#facc14',
	'#223273',
	'#8543e0',
	'#13c2c2',
	'#3436c7',
	'#f04864'
]

// 图表数据
const lineData = computed(() => {
	return {
		categories: monthlyTrend.value.map(item => item.month),
		series: [{
			name: '收入',
			data: monthlyTrend.value.map(item => parseFloat(item.income.replace(',', '')))
		}, {
			name: '支出',
			data: monthlyTrend.value.map(item => parseFloat(item.expense.replace(',', '')))
		}]
	}
})

const expensePieData = computed(() => {
	return {
		series: overview.expense.categories.map((category, index) => ({
			name: category.category.name,
			data: parseFloat(category.amount.replace(',', '')),
			color: pieColors[index % pieColors.length]
		}))
	}
})

const incomePieData = computed(() => {
	return {
		series: overview.income.categories.map((category, index) => ({
			name: category.category.name,
			data: parseFloat(category.amount.replace(',', '')),
			color: pieColors[index % pieColors.length]
		}))
	}
})

// 处理日期变化
const handleDateChange = (e) => {
	currentDate.value = e.detail.value
	// 模拟数据更新,实际应该调用API
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
	padding: 15px;
	padding-bottom: 30px;
}

.date-picker {
	background-color: #fff;
	border-radius: 8px;
	padding: 15px;
	margin-bottom: 15px;
	
	.picker-value {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		color: #333;
		
		.iconfont {
			margin-left: 5px;
			font-size: 14px;
			color: #666;
		}
	}
}

.overview-card {
	background-color: #fff;
	border-radius: 8px;
	padding: 20px;
	margin-bottom: 15px;
	display: flex;
	align-items: center;
	
	.overview-item {
		flex: 1;
		text-align: center;
		
		.label {
			font-size: 14px;
			color: #666;
			margin-bottom: 5px;
			display: block;
		}
		
		.amount {
			font-size: 20px;
			font-weight: bold;
			color: #333;
			
			&.income {
				color: #52c41a;
			}
			
			&.expense {
				color: #ff4d4f;
			}
		}
	}
	
	.divider {
		width: 1px;
		height: 40px;
		background-color: #f0f0f0;
	}
}

.chart-card {
	background-color: #fff;
	border-radius: 8px;
	padding: 15px;
	margin-bottom: 15px;
	
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
		
		.title {
			font-size: 16px;
			font-weight: bold;
			color: #333;
		}
		
		.legend {
			display: flex;
			align-items: center;
			
			.legend-item {
				display: flex;
				align-items: center;
				margin-left: 15px;
				
				.dot {
					width: 8px;
					height: 8px;
					border-radius: 4px;
					margin-right: 5px;
					
					&.income {
						background-color: #52c41a;
					}
					
					&.expense {
						background-color: #ff4d4f;
					}
				}
				
				text {
					font-size: 12px;
					color: #666;
				}
			}
		}
		
		.total {
			font-size: 14px;
			color: #666;
		}
	}
	
	.category-list {
		margin-top: 15px;
		
		.category-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.category-info {
				display: flex;
				align-items: center;
				
				.dot {
					width: 8px;
					height: 8px;
					border-radius: 4px;
					margin-right: 8px;
				}
				
				.name {
					font-size: 14px;
					color: #333;
				}
			}
			
			.category-amount {
				text-align: right;
				
				.amount {
					font-size: 14px;
					color: #333;
					margin-right: 10px;
				}
				
				.percent {
					font-size: 12px;
					color: #999;
				}
			}
		}
	}
}
</style> 