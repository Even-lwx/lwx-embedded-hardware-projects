"""更新本次归档涉及的工具路径，并检查 Python 源文件语法。"""
from pathlib import Path
import ast
import json

ROOT = Path('D:/lwx/lwx-project')
AD = ROOT / 'AD7682'
changed = []
existing_errors = []

def update(file, transform):
    """按原文件编码读取文本，内容变化时保存并记录文件位置。"""
    old = file.read_text(encoding='utf-8-sig')
    new = transform(old)
    if new != old:
        if file.suffix == '.py':
            try:
                ast.parse(old, filename=str(file))
            except SyntaxError:
                pass
            else:
                ast.parse(new, filename=str(file))
        file.write_text(new, encoding='utf-8')
        changed.append(str(file))

def analysis_paths(text):
    """将历史脚本中的临时工作区和输出路径更新为分类后的目录。"""
    text = text.replace('tmp/', 'tools/analysis/workspace/')
    text = text.replace('AD7682\\tmp\\', 'AD7682\\tools\\analysis\\workspace\\')
    import re
    text = re.sub(r'output/(?!reports/|releases/)', 'output/reports/', text)
    text = re.sub(r'AD7682\\output\\(?!reports\\|releases\\)', lambda _: 'AD7682\\output\\reports\\', text)
    return text

analysis = AD / 'tools/analysis'
for file in analysis.rglob('*'):
    if file.suffix not in {'.py', '.ps1', '.cjs'}:
        continue
    def transform(text, file=file):
        text = analysis_paths(text)
        if file.parent == analysis / 'workspace':
            text = text.replace('Path(__file__).resolve().parents[1]', 'Path(__file__).resolve().parents[3]')
        if file.name == 'rebuild_report.py' and file.parent == analysis:
            text = text.replace("Path(r'D:/lwx/lwx-project/AD7682')", 'Path(__file__).resolve().parents[2]')
        return text
    update(file, transform)

for file in [AD / 'code/host/README.md', AD / 'code/host/DEVELOPMENT.md']:
    update(file, lambda text: text.replace('output/AD7682Host', 'output/releases/AD7682Host').replace('output\\AD7682Host', 'output\\releases\\AD7682Host'))

course = ROOT / '资料归档/其他资料/周小闹课程汇报'
for file in (course / '构建').glob('*.mjs'):
    def course_paths(text):
        text = text.replace('D:/lwx/lwx-project/AD7682', str(course).replace('\\', '/'))
        return text.replace("'.codex-build'", "'构建'").replace("'assets'", "'素材'").replace("'output'", "'成品'").replace("'.codex-finalizer'", "'校验'")
    update(file, course_paths)

builder = ROOT / 'tools/工程清单/build.mjs'
def builder_paths(text):
    return text.replace('D:/lwx/lwx-project/sheet_build', 'D:/lwx/lwx-project/tools/工程清单').replace('analysis_output*/：测量分析输出', 'output/reports/：测量分析输出')
update(builder, builder_paths)

checked = []
for file in analysis.rglob('*.py'):
    try:
        ast.parse(file.read_text(encoding='utf-8-sig'), filename=str(file))
        checked.append(str(file))
    except SyntaxError as error:
        existing_errors.append({'文件': str(file), '行号': error.lineno, '问题': error.msg})
report = {'更新路径文件数': len(changed), 'Python语法检查通过数': len(checked), '历史脚本既有语法问题': existing_errors, '已更新文件': changed}
(Path(__file__).parent / '路径检查记录.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'更新路径文件数': len(changed), 'Python语法检查通过数': len(checked), '历史脚本既有语法问题数': len(existing_errors)}, ensure_ascii=False))
