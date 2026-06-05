---
title: "MCP 统一入口设计思路"
published: 2026-03-11
category: "开发"
description: "## 概述 MCP（Model Context Protocol）架构采用**统一入口**设计模式，将原本分散的多个功能整合到单一的工具接口中，通过 `action` 参数区分不同的子操作。这种设计大幅' tags: ['开发'] --- # MCP 统一入口设计思路  ## 📋 目录  - [概述](#概述) - [设计动机](#设计动机) - [统一入口的定义](#统一入口的定义) - [架构"
tags: ["开发"]
---
## 概述 MCP（Model Context Protocol）架构采用**统一入口**设计模式，将原本分散的多个功能整合到单一的工具接口中，通过 `action` 参数区分不同的子操作。这种设计大幅"
tags: ["开发"]
---
# MCP 统一入口设计思路

## 📋 目录

- [概述](#概述)
- [设计动机](#设计动机)
- [统一入口的定义](#统一入口的定义)
- [架构分层](#架构分层)
- [实现模式](#实现模式)
- [关键技术细节](#关键技术细节)
- [设计优势](#设计优势)
- [设计模式总结](#设计模式总结)
- [最佳实践](#最佳实践)
- [架构图](#架构图)

---

## 概述

MCP（Model Context Protocol）架构采用**统一入口**设计模式，将原本分散的多个功能整合到单一的工具接口中，通过 `action` 参数区分不同的子操作。这种设计大幅减少了工具数量，提高了系统的可维护性和易用性。

---

## 设计动机

### 问题 1：工具泛滥

如果有 20 个功能模块，每个模块有 5-6 个操作，会产生 **100+ 个 MCP 工具**：
- 工具过多导致 Agent 难以选择
- 增加调用错误的概率
- Agent 需要记忆大量工具名称

### 问题 2：功能分散

相似功能分散在不同工具中：
- 代码重复严重
- 维护和扩展困难
- 需要在多个工具中同步修改

### 问题 3：接口不一致

不同工具的参数命名、返回格式不统一：
- Agent 需要记忆每个工具的特殊用法
- 增加学习成本
- 容易出错

---

## 统一入口的定义

**公式**：统一入口 = 单一 MCP 工具 + action 参数 + 多个子操作

### 对比示例

#### 传统方式：多个独立工具

```python
# 6 个独立工具
@tool
def search_knowledge(query: str, ...) -> str: ...

@tool
def add_knowledge(content: str, ...) -> str: ...

@tool
def get_detail_knowledge(entry_id: str) -> str: ...

@tool
def export_knowledge() -> str: ...

@tool
def list_backups() -> str: ...

@tool
def restore_backup(backup_file: str) -> str: ...
```

#### 统一入口方式：1 个工具 + action 参数

```python
@tool(name='knowledge')
def knowledge(
    action: str,
    query: Optional[str] = None,
    content: Optional[str] = None,
    entry_id: Optional[str] = None,
    backup_file: Optional[str] = None,
    ...
) -> str:
    """知识库统一入口 - 整合 6 个知识库相关工具"""
    if action == 'search': ...
    elif action == 'add': ...
    elif action == 'get_detail': ...
    elif action == 'export': ...
    elif action == 'list_backups': ...
    elif action == 'restore': ...
```

**效果**：工具数量从 6 个减少到 1 个，减少 **83%**

---

## 架构分层

MCP 架构中的统一入口分为三个层次：

### 核心层统一入口（逻辑断层相关）

| 工具名 | 功能描述 | 支持的操作 |
|--------|---------|-----------|
| `context` | 防遗忘统一入口 | `get_planner_summary` / `get_reflector_summary` / `add_objective` / `clear` |
| `context_compress` | 上下文压缩统一入口 | `should_compress` / `compress` / `get_history` / `clear` |
| `reflector` | 反思器统一入口 | `reflect_execution` / `reflect_batch` / `reflect_global` / `get_insights` / `get_patterns` / `get_vetoed` / `clear_veto` |
| `failure_attribution` | 失败归因统一入口 | `attribute` / `get_stats` / `clear` |
| `planner` | 规划器统一入口 | `initial_plan` / `dynamic_plan` / `get_history` / `get_rejected` / `add_rejected` |
| `agent` | P-E-R Agent 统一入口 | `run` |

### 功能层统一入口（渗透测试相关）

| 工具名 | 功能描述 | 支持的操作 |
|--------|---------|-----------|
| `knowledge` | 知识库统一入口 | `search` / `add` / `get_detail` / `export` / `list_backups` / `restore` |
| `param_library` | 参数库统一入口 | `extract_js` / `extract_response` / `get_common` / `get_for_api` / `stats` / `save` |
| `browser` | 浏览器操作统一入口 | `navigate` / `screenshot` / `capture` / `interactive` / `list` / `close` |
| `session` | 会话管理统一入口 | `add` / `get` / `clear` / `list` |
| `llm` | LLM 操作统一入口 | `analyze` / `report` / `enhance` / `status` / `set_key` |
| `pentest_tools` | 渗透测试工具统一入口 | `list` / `run` / `recommend` / `guidelines` |
| `workflow` | 工作流管理统一入口 | `set_target` / `status` / `recommend` / `plan` / `finding` / `complete` |
| `file_operation` | 文件操作统一入口 | `write` / `classify` / `organize` / `info` |
| `dev_tools` | 开发工具统一入口 | `predev_check` / `opt_record` / `opt_list` / `opt_view` / `dev_start` / `dev_complete` / `dev_status` / `dev_register` / `dev_list` |
| `mcp_log` | MCP 日志统一入口 | `list` / `stats` / `session` / `clear` |

### 专项工具统一入口

| 工具名 | 功能描述 | 支持的操作 |
|--------|---------|-----------|
| `miniprogram_decompiler` | 微信小程序反编译工具 | 解包 / 扫描 / 提取 API / 分析签名 |

---

## 实现模式

### 命令模式（Command Pattern）

每个统一入口都是一个命令处理器，通过 `action` 参数区分不同的子命令：

```python
@self._logged_tool(name='context', description='【防遗忘统一入口】上下文管理')
async def context(
    action: str = Field(description='操作类型：get_planner_summary/get_reflector_summary/add_objective/clear'),
    objective: Optional[str] = Field(default=None, description='长期目标（add_objective 时必填）'),
    goal: Optional[str] = Field(default=None, description='长期目标别名')
) -> str:
    """防遗忘统一入口 - 管理上下文和防止遗忘"""
    try:
        if not self.context_manager:
            return "错误：context_manager 未初始化"
        
        if goal and not objective:
            objective = goal
        
        if action == 'get_planner_summary':
            # 处理子命令 1
            summary = self.context_manager.get_planner_summary()
            return format_summary(summary)
        
        elif action == 'get_reflector_summary':
            # 处理子命令 2
            summary = self.context_manager.get_reflector_summary()
            return format_summary(summary)
        
        elif action == 'add_objective':
            # 处理子命令 3（需要额外参数）
            if not objective:
                return "错误：add_objective 操作需要 objective 参数"
            self.context_manager.add_long_term_objective(objective)
            return f"✅ 长期目标已添加：{objective}"
        
        elif action == 'clear':
            # 处理子命令 4
            self.context_manager.clear_planner_context()
            self.context_manager.clear_reflector_context()
            return "✅ 所有上下文已清空"
        
        else:
            return f"错误：未知的操作类型 '{action}'"
    
    except Exception as e:
        return f"错误：{str(e)}"
```

### 参数验证模式

统一入口通过参数验证确保子命令的正确执行：

```python
@self._logged_tool(name='planner', description='【逻辑断层统一入口】规划器')
async def planner(
    action: str = Field(description='操作类型：initial_plan/dynamic_plan/get_history/get_rejected/add_rejected'),
    goal: Optional[str] = Field(default=None, description='目标（initial_plan/dynamic_plan 时必填）'),
    context: Optional[str] = Field(default=None, description='上下文（JSON 格式字符串）'),
    strategy_name: Optional[str] = Field(default=None, description='策略名称（add_rejected 时必填）'),
    reason: Optional[str] = Field(default=None, description='原因（add_rejected 时必填）')
) -> str:
    """逻辑断层统一入口 - 规划器操作"""
    try:
        if action == 'initial_plan':
            # 验证必填参数
            if not goal:
                return "错误：initial_plan 操作需要 goal 参数"
            ctx = json.loads(context) if context else None
            result = self.planner.initial_plan(goal, ctx)
            return format_result(result)
        
        elif action == 'add_rejected':
            # 验证多个必填参数
            if not strategy_name or not reason:
                return "错误：add_rejected 操作需要 strategy_name 和 reason 参数"
            self.planner.add_rejected_strategy(strategy_name, reason)
            return f"✅ 策略已标记为拒绝：{strategy_name}"
```

### 结果格式化模式

统一入口使用一致的格式返回结果：

```python
def format_result(result: Dict) -> str:
    """统一的结果格式化"""
    lines = ["=" * 70, "📋 标题", "=" * 70]
    
    # 添加关键指标
    lines.append(f"指标 1: {result.get('key_metric_1')}")
    lines.append(f"指标 2: {result.get('key_metric_2')}")
    
    # 添加列表内容
    if 'items' in result:
        lines.append("\n【列表内容】:")
        for item in result['items']:
            lines.append(f"  - {item}")
    
    lines.append("=" * 70)
    return "\n".join(lines)
```

---

## 关键技术细节

### 工具注册装饰器

统一入口通过装饰器自动注册到 MCP 服务器：

```python
def _logged_tool(self, name, description):
    """带日志记录的工具装饰器工厂"""
    def decorator(func):
        # 1. 创建带日志包装的工具函数
        logged_func = self._create_logged_tool(name, func)
        
        # 2. 注册到 FastMCP 服务器
        self.server.tool(name=name, description=description)(logged_func)
        
        # 3. 自动记录到 registered_tools 字典
        if not hasattr(self, 'registered_tools'):
            self.registered_tools = {}
        self.registered_tools[name] = logged_func
        
        return logged_func
    return decorator
```

### ToolRouter 的参数映射

统一入口通过 ToolRouter 进行参数映射，解决 Planner 与工具之间的参数名不匹配问题：

```python
def _map_tool_arguments(self, tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    """根据工具名映射参数"""
    mapped_args = args.copy()
    tool_name_lower = tool_name.lower()
    
    # 处理 target_url -> url（browser, http_request 等）
    if 'target_url' in mapped_args:
        if 'browser' in tool_name_lower or 'http_request' in tool_name_lower:
            mapped_args['url'] = mapped_args.pop('target_url')
    
    # 处理 target -> goal（ai_pentest）
    if 'target' in mapped_args:
        if 'ai_pentest' in tool_name_lower:
            mapped_args['goal'] = mapped_args.pop('target')
    
    return mapped_args
```

### 异步调用与重试机制

统一入口支持异步调用和自动重试：

```python
async def call_tool(
    self,
    tool_name: str,
    args: Optional[Dict[str, Any]] = None,
    max_retries: int = 3,
    timeout: int = 300
) -> Dict[str, Any]:
    """调用 MCP 工具（带重试机制）"""
    
    tool_func = self.registered_tools[tool_name]
    args = args or {}
    
    for attempt in range(1, max_retries + 1):
        try:
            if asyncio.iscoroutinefunction(tool_func):
                result = await asyncio.wait_for(
                    tool_func(**args),
                    timeout=timeout
                )
            else:
                result = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None, lambda: tool_func(**args)
                    ),
                    timeout=timeout
                )
            
            return result
        
        except asyncio.TimeoutError:
            if attempt == max_retries:
                return {
                    "success": False,
                    "error": f"工具调用超时：{tool_name} (>{timeout}s)",
                    "attempts": attempt
                }
            await asyncio.sleep(1 * attempt)  # 指数退避
        
        except Exception as e:
            if attempt == max_retries:
                return {
                    "success": False,
                    "error": f"工具执行失败：{str(e)}",
                    "attempts": attempt
                }
            await asyncio.sleep(1 * attempt)
```

---

## 设计优势

### 减少工具数量

| 方案 | 工具数量 | Agent 选择难度 |
|------|---------|--------------|
| 传统方式 | 100+ 个独立工具 | 高（容易选错） |
| 统一入口 | 17 个统一入口 | 低（清晰明确） |

**工具数量减少：约 85%**

### 提高可维护性

**传统方式**：
```python
# 修改搜索逻辑需要改 3 个地方
def search_knowledge_v1(...): ...
def search_knowledge_v2(...): ...
def search_knowledge_by_category(...): ...
```

**统一入口方式**：
```python
# 修改搜索逻辑只需改 1 个地方
def knowledge(action: str, ...):
    if action == 'search':
        # 统一的搜索逻辑
```

### 增强一致性

所有统一入口遵循相同的设计模式：

```python
# 1. 统一的参数命名
action: str = Field(description='操作类型')

# 2. 统一的错误处理
try:
    # 业务逻辑
except Exception as e:
    return f"错误：{str(e)}"

# 3. 统一的结果格式
lines = ["=" * 70, "标题", "=" * 70]
return "\n".join(lines)
```

### 便于扩展

添加新子操作只需在现有统一入口中添加分支：

```python
@self._logged_tool(name='context', description='【防遗忘统一入口】上下文管理')
async def context(action: str, ...) -> str:
    # 原有操作
    if action == 'get_planner_summary': ...
    elif action == 'get_reflector_summary': ...
    
    # ✅ 新增操作（不影响现有功能）
    elif action == 'export_context':
        # 新功能
        pass
    
    # ✅ 继续添加更多操作...
```

---

## 设计模式总结

### 命令模式（Command Pattern）
- **应用**：通过 `action` 参数区分不同子操作
- **优势**：将请求封装为对象，支持参数化和队列化

### 适配器模式（Adapter Pattern）
- **应用**：ToolRouter 适配 Planner 与 MCP 工具
- **优势**：解决接口不匹配问题

### 单例模式（Singleton Pattern）
- **应用**：各组件（context_manager, planner, reflector 等）全局唯一
- **优势**：确保状态一致性

### 工厂模式（Factory Pattern）
- **应用**：`_logged_tool` 装饰器工厂
- **优势**：统一工具注册逻辑

### 策略模式（Strategy Pattern）
- **应用**：Planner 根据上下文选择不同规划策略
- **优势**：灵活切换算法

### 观察者模式（Observer Pattern）
- **应用**：Reflector 观察执行结果并反思
- **优势**：解耦观察者和被观察者

---

## 最佳实践

### 命名规范

```python
# ✅ 好的命名：清晰表达功能领域
'context'      # 上下文管理
'reflector'    # 反思器
'planner'      # 规划器
'knowledge'    # 知识库
'param_library' # 参数库

# ❌ 避免模糊命名
'tool1'        # 无意义
'manager'      # 太宽泛
```

### Action 参数设计

```python
# ✅ 使用枚举式字符串
action: str = Field(
    description='操作类型：search/add/get_detail/export'
)

# ✅ 在 docstring 中明确说明
"""
知识库统一入口 - 整合 6 个知识库相关工具

操作类型:
  - search: 搜索知识
  - add: 添加知识
  - get_detail: 获取详情
  - export: 导出知识库
"""
```

### 参数验证

```python
# ✅ 清晰标注必填参数
if action == 'add':
    if not content:
        return "错误：add 操作需要 content 参数"

# ✅ 使用类型提示
action: str
query: Optional[str]
limit: int = 5
```

### 错误处理

```python
# ✅ 统一的错误处理模式
try:
    # 业务逻辑
    if not self.component:
        return f"错误：{component_name} 未初始化"
    
    # 参数验证
    if action == 'xxx' and not required_param:
        return f"错误：{action}操作需要{param_name}参数"
    
    # 执行逻辑
    result = self.component.do_something()
    return format_result(result)

except Exception as e:
    return f"错误：{str(e)}"
```

---

## 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Agent (Executor)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    ToolRouter                            │
│  • 工具路由  • 参数映射  • 重试机制  • 超时控制          │
└────────────┬─────────────────────────────────┬──────────┘
             │                                 │
             ▼                                 ▼
    ┌─────────────────┐              ┌─────────────────┐
    │  核心层统一入口  │              │  功能层统一入口  │
    ├─────────────────┤              ├─────────────────┤
    │ context         │              │ knowledge       │
    │ context_compress│              │ param_library   │
    │ reflector       │              │ browser         │
    │ failure_attrib. │              │ session         │
    │ planner         │              │ llm             │
    │ agent           │              │ pentest_tools   │
    └─────────────────┘              │ workflow        │
                                     │ file_operation  │
                                     │ dev_tools       │
                                     │ mcp_log         │
                                     └─────────────────┘
```

---

## 总结

MCP 架构中的统一入口设计体现了以下核心思想：

1. **化繁为简**：将 100+ 个工具精简为 17 个统一入口
2. **模式统一**：所有统一入口遵循相同的设计模式
3. **易于扩展**：添加新功能不影响现有代码
4. **高内聚低耦合**：每个统一入口负责一个功能领域
5. **用户体验优先**：减少 Agent 的选择负担，提高调用准确性

这种设计模式不仅适用于 MCP 架构，也可以应用到其他需要管理大量工具/命令的系统中。

---

**文档生成时间**: 2026-03-11  
**文档版本**: v1.0  
**作者**: MCP Architecture Team
