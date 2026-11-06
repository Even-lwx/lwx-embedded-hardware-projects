import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputDir = 'D:/lwx/lwx-project';
const buildDir = 'D:/lwx/lwx-project/tools/工程清单';
await fs.mkdir(outputDir, {recursive:true});
const wb = Workbook.create();
const overview = wb.worksheets.add('项目总览');
const details = wb.worksheets.add('文件明细');
overview.showGridLines = false;
details.showGridLines = false;

const projects = [
  ['AD7682','STM32G031C8','四路 AD7682 采集；温湿度、双气压、电池、RTC、OLED、W25Q128 日志；Windows 串口上位机和 CSV 导出','AD7682-Ver1.0 原理图/PCB；后续 Ver1.1、Ver1.2 版本文件','code/MDK-ARM/code.uvprojx；code/Core/Src/main.c；code/host/README.md','pcb/AD7682-Ver1.0/AD7682.PrjPcb；pcb/AD7682-Ver1.0/PCB1.PcbDoc','master','c6f26a4','已提交并同步','https://github.com/Even-lwx/AD7682'],
  ['Triple 1S Battery Charger','STM32G031C8','三路单节锂电池充电；BQ24040；电流采样；OLED；按键和充电状态指示','三路充电器原理图、PCB、封装库及发布输出','code/README-bringup.md；code/Core/Src/main.c；code/code/Hardware/','pcb/Triple 1S Battery Charger/Triple 1S Battery Charger.PrjPcb；PCB1.PcbDoc','master','466168c','已提交并同步','https://github.com/Even-lwx/Triple-1S-Battery-Charger'],
  ['QI5W-R-Ver2.0','无固件（Altium 工程）','无线充电接收端硬件设计','无线充电接收板原理图、PCB、元件库和设计输出','README.md；以 Altium 工程文件为主','QI5W-R-Ver2.0/QI5W-R-Ver2.0.PrjPcb；QI5W-R-Ver2.0/PCB1.PcbDoc','main','8c958f8','已提交并同步','https://github.com/Even-lwx/QI5W-R-Ver2.0'],
  ['ADS124S08_RTD_Acq','STM32G031C8','四路 PT1000 采集；ADS124S08；IEC 60751 温度换算；PID 加热温控；RS485/Modbus RTU','ADS124S08 RTD 采集板原理图、PCB 和元件库','code/code/README.md；code/Core/Src/main.c；code/code/modbus_rtu/','pcb/ADS124S08‑RTD‑Acq/ADS124S08‑RTD‑Acq.PrjPcb；PCB1.PcbDoc','main','646e190','已提交并同步','https://github.com/Even-lwx/ADS124S08_RTD_Acq'],
  ['STM32F103RCT6最小系统板','STM32F103RCT6（CubeMX 配置）','最小系统板配套 MCU 工程配置和硬件设计','STM32F103RCT6 多版本原理图、PCB、封装库和发布文件','code/code.ioc','pcb/STM32F103RCT6/STM32F103RCT6.PrjPcb；pcb/STM32F103RCT6/PCB1.PcbDoc','main','3232558','已提交并同步','https://github.com/Even-lwx/STM32F103RCT6-Minimal-System-Board'],
  ['HookWeightModule','STM32G031C8T6','ADS1232 称重采集；零点/重量/多点校准；五点中值和定点卡尔曼滤波；串口调试','ADS1232 吊秤模块原理图、PCB 和元件库','code/STM32G031C8T6/MDK-ARM/；code/STM32G031C8T6/code/Filter/；README.md','pcb/ADS1232/；pcb/ADS1232/HookWeightModule-Ver1.0.7z','master','0cf9b69','已提交并同步','https://github.com/Even-lwx/HookWeightModule'],
  ['QiRec-5-T','无固件（Altium 工程）','无线充电发射端硬件设计','QiRec-5-T 当前版和 Ver1.0 原理图、PCB、封装库、发布压缩包','README.md；以 Altium 工程文件为主','QiRec-5-T/QiRec-5-T.PrjPcb；QiRec-5-T/PCB1.PcbDoc','main','c7fe400','已提交并同步','https://github.com/Even-lwx/QiRec-5-T'],
  ['QiRec-5-R','无固件（Altium 工程）','无线充电接收端硬件设计','QiRec-5 接收端当前版和 Ver1.0 原理图、PCB、封装库、发布压缩包','README.md；以 Altium 工程文件为主','pcb/QiRec-5/QiRec-5.PrjPcb；pcb/QiRec-5/PCB1.PcbDoc','main','feed174','已提交并同步','https://github.com/Even-lwx/QiRec-5-R'],
  ['UML244R','STM32F103C8T6','步进电机驱动器；RS485 方向控制；Modbus RTU 从机；调试日志和寄存器接口','UML244R 驱动器原理图、PCB、元件库和说明书','code/Code/modbus_rtu.c；code/Code/rs485.c；code/MDK-ARM/','pcb/；doc/','无实物先构建代码框架','7fcc7e9','已提交并同步','https://github.com/Even-lwx/UML244R']
];

const detailsRows = [
 ['AD7682','程序','code/MDK-ARM/code.uvprojx','Keil 固件工程入口'],['AD7682','程序','code/Core/Src/main.c','应用调度与采集入口'],['AD7682','程序','code/host/README.md','Windows 上位机说明'],['AD7682','PCB','pcb/AD7682-Ver1.0/AD7682.PrjPcb','Altium 工程'],['AD7682','PCB','pcb/AD7682-Ver1.0/PCB1.PcbDoc','PCB 文件'],
 ['Triple 1S Battery Charger','程序','code/Core/Src/main.c','固件入口'],['Triple 1S Battery Charger','程序','code/code/Hardware/','充电器硬件抽象与界面代码'],['Triple 1S Battery Charger','PCB','pcb/Triple 1S Battery Charger/','原理图、PCB 和库文件'],
 ['QI5W-R-Ver2.0','PCB','QI5W-R-Ver2.0/QI5W-R-Ver2.0.PrjPcb','Altium 工程'],['QI5W-R-Ver2.0','PCB','QI5W-R-Ver2.0/PCB1.PcbDoc','PCB 文件'],
 ['ADS124S08_RTD_Acq','程序','code/code/ads124s08/','ADS124S08 驱动'],['ADS124S08_RTD_Acq','程序','code/code/pt1000/','PT1000 电阻和温度换算'],['ADS124S08_RTD_Acq','程序','code/code/modbus_rtu/','Modbus RTU 协议层'],['ADS124S08_RTD_Acq','PCB','pcb/ADS124S08‑RTD‑Acq/','原理图、PCB 和库文件'],
 ['STM32F103RCT6最小系统板','程序','code/code.ioc','CubeMX 工程配置'],['STM32F103RCT6最小系统板','PCB','pcb/STM32F103RCT6/STM32F103RCT6.PrjPcb','当前版本 Altium 工程'],['STM32F103RCT6最小系统板','PCB','pcb/STM32F103RCT6-Ver1.0/','1.0 版本硬件工程'],
 ['HookWeightModule','程序','code/STM32G031C8T6/code/Filter/','重量滤波与稳定判定'],['HookWeightModule','程序','code/STM32G031C8T6/code/Debug/serial_debug.c','串口校准和调试命令'],['HookWeightModule','PCB','pcb/ADS1232/','ADS1232 硬件工程'],
 ['QiRec-5-T','PCB','QiRec-5-T/QiRec-5-T.PrjPcb','当前版本 Altium 工程'],['QiRec-5-T','PCB','QiRec-5-T-Ver1.0/','1.0 版本硬件工程'],
 ['QiRec-5-R','PCB','pcb/QiRec-5/QiRec-5.PrjPcb','当前版本 Altium 工程'],['QiRec-5-R','PCB','pcb/QiRec-5-Ver1.0/','1.0 版本硬件工程'],
 ['UML244R','程序','code/Code/rs485.c','RS485 驱动'],['UML244R','程序','code/Code/modbus_rtu.c','Modbus RTU 从机协议'],['UML244R','程序','code/Code/uml244r.c','驱动器业务接口'],['UML244R','PCB','pcb/','原理图、PCB 和库文件'],['UML244R','文档','doc/','驱动器说明书和调试资料']
];

async function walk(dir,relative='') {
 const list=[];
 for(const entry of await fs.readdir(dir,{withFileTypes:true})) {
  if(entry.name.startsWith('.') || /^(History|__Previews|node_modules|Drivers|Objects|Listings|RTE|DebugConfig|__pycache__|tmp|output|assets|analysis_output.*)$/i.test(entry.name) || /^Project (Outputs|Logs)/i.test(entry.name)) continue;
  const rel=relative?`${relative}/${entry.name}`:entry.name;
  if(entry.isDirectory())list.push(...await walk(path.join(dir,entry.name),rel));
  else if(/\.(prjpcb|pcbdoc|schdoc|uvprojx|ioc)$/i.test(entry.name))list.push(rel);
 }
 return list.sort();
}
detailsRows.length=0;
for(const p of projects) {
 const dir=path.join(outputDir,p[0]);
 const files=await walk(dir);
 p[5]=files.filter(f=>/\.(prjpcb|pcbdoc)$/i.test(f)).join('\n')||'未找到可直接打开的设计源文件';
 const software=files.filter(f=>/\.(uvprojx|ioc)$/i.test(f));
 p[4]=software.length?software.join('\n'):'未发现独立固件工程；见 README.md';
 for(const rel of files){
  const type=/\.(uvprojx|ioc)$/i.test(rel)?'程序':'PCB';
  const purpose=/\.uvprojx$/i.test(rel)?'Keil 固件工程':/\.ioc$/i.test(rel)?'STM32CubeMX 配置':/\.prjpcb$/i.test(rel)?'Altium 工程入口':/\.schdoc$/i.test(rel)?'原理图源文件':'PCB 源文件';
  detailsRows.push([p[0],type,rel,purpose]);
 }
 for(const rel of ['README.md','code/code/README.md','code/README-bringup.md','code/host/README.md','code/host/DEVELOPMENT.md','code/host/app.py','code/Core/Src/main.c']) {
  try {await fs.access(path.join(dir,rel));const source=/\.(py|c)$/.test(rel);detailsRows.push([p[0],source?'程序':'文档',rel,rel==='code/host/app.py'?'Windows 串口上位机入口':rel==='code/Core/Src/main.c'?'固件主程序入口':rel==='README.md'?'工程说明':'功能、开发或操作说明']);}catch{}
 }
 if(p[0]==='AD7682') {
  const hostFiles=[['code/host/device.py','后台串口线程、握手、设备设置、历史导出与文件管理'],['code/host/protocol.py','CRC16/CRC32 校验、帧解析、批量接收与 CSV 写入'],['code/host/datetime_picker.py','日期、日历与时间选择控件'],['code/host/demo.py','不连接实物的模拟设备与演示模式'],['code/host/requirements.txt','Python 依赖清单：串口通信与 EXE 打包工具'],['code/host/test_host.py','协议、CSV 与设备线程回归测试'],['code/host/test_window.py','窗口接收模式测试'],['code/host/test_batch.py','整批接收模式测试']];
  for(const [rel,purpose] of hostFiles){await fs.access(path.join(dir,rel));detailsRows.push([p[0],'上位机',rel,purpose]);}
  for(const rel of ['tools/analysis/','tools/analysis/workspace/','data/measurements/','output/reports/','output/releases/','archive/source_snapshots/']){await fs.access(path.join(dir,rel));detailsRows.push([p[0],'整理目录',rel,rel.startsWith('output/releases')?'上位机各版本 EXE、配套固件与发布包':rel.startsWith('output/reports')?'实验报告、图表与统计结果':rel.startsWith('data/')?'原始测量工作簿':rel.startsWith('archive/')?'旧版源码压缩快照':'历史分析脚本、报告生成与测试资料']);}
 }
}
projects[0][3]='AD7682 多版本原理图与 PCB；版本及文件位置见文件明细';
projects[2][3]='无线充电接收板原理图、PCB 与元件库；工程位于 pcb/';
projects[8][2]='STM32 通过 RS485/Modbus RTU 控制外部 UML244R 驱动器；运动命令、状态读取与调试接口';
projects[8][3]='RS485 测试板原理图与 PCB';

const boards=['多传感器采集记录板','三路单节锂电池充电板','无线充电接收板（2.0 版）','四路 PT1000 温度采集与温控板','STM32F103RCT6 最小系统板','吊秤称重采集模块板','无线充电发射板','无线充电接收板','RS485 步进驱动器控制测试板'];
const purposes=['采集模拟量和环境参数，记录测量数据并通过串口导出。','为三节单节锂电池提供独立充电通道，并监测充电状态。','接收无线充电能量，为后级电路提供电源。','测量四路 PT1000 温度，控制加热，通过 RS485 进行数据交互。','为 STM32F103RCT6 提供基础运行与调试平台，作为功能开发底板。','读取称重传感器信号，完成重量换算、滤波与校准。','驱动无线充电发射端，向接收端传输能量。','配合无线充电发射端接收能量，为负载提供电源。','由 STM32 通过 RS485/Modbus RTU 控制外部 UML244R 步进驱动器。'];
const structures=[
 'code/host/app.py：上位机启动入口\ncode/code/：MCU 自有驱动\npcb/：多版本硬件；doc/：资料\ntools/analysis/：分析脚本\noutput/reports/：报告；releases/：发布包',
 'code/：STM32 固件与测试工具\ncode/code/Hardware/：硬件驱动\npcb/Triple 1S Battery Charger/：原理图、PCB 与本地库',
 'pcb/QI5W-R-Ver2.0/：Altium 工程、原理图、PCB 与本地库\n未发现独立固件工程',
 'code/：采集、温控与通信程序\ncode/code/：自有模块\npcb/：硬件设计\ndoc/：器件资料\ntools/：辅助检查工具',
 'code/code.ioc：CubeMX 配置\npcb/：多版本原理图、PCB 与本地库\ndoc/：器件资料',
 'code/STM32G031C8T6/：称重固件\npcb/ADS1232/：多版本硬件\noutput/reports/：测量分析输出',
 'QiRec-5-T/：当前硬件设计\nQiRec-5-T-Ver1.0/：1.0 版设计\n根目录 ZIP：版本归档\n未发现独立固件工程',
 'pcb/QiRec-5/：当前硬件设计\npcb/QiRec-5-Ver1.0/：1.0 版设计\npcb/ 下 ZIP：版本归档\n未发现独立固件工程',
 'code/：STM32 固件\ncode/Code/：RS485、Modbus 与驱动器接口\npcb/project/485-test/：测试板\ndoc/：说明与调试资料'
];
for(let i=0;i<projects.length;i++) {
 const p=projects[i];
 const source=p[5].split('\n').filter(f=>/\.prjpcb$/i.test(f));
 projects[i]=[p[0],boards[i],purposes[i],p[1]+'；'+p[2],structures[i],source.length+' 份 Altium 工程；完整路径见“文件明细”'];
}

// 总览
 overview.getRange('A1:F1').merge(); overview.getRange('A1').values=[['程序与 PCB 工程用途及结构清单']];
 overview.getRange('A2:F2').merge(); overview.getRange('A2').values=[['共 9 个工程｜整理日期：2026-11-06｜按现有文件概括用途；路径相对于各工程根目录，具体文件见“文件明细”。']];
 overview.getRange('A4:F4').values=[['工程名称','是什么板子','工程作用','主控与程序功能','工程目录结构','硬件工程入口']];
 overview.getRange('A5:F13').values=projects;

 // 上位机源码入口单独说明，避免与 MCU 固件或已打包 EXE 混淆。
 overview.getRange('A16:F16').merge(); overview.getRange('A16').values=[['AD7682 上位机源码与运行位置']];
 overview.getRange('A18:F18').values=[['所属工程与用途','源码完整目录','界面启动入口','主要源码模块','源码运行方式','已打包程序位置']];
 const exeRel='AD7682/output/releases/AD7682Host-v1.4-Windows/AD7682Host-v1.4/AD7682Host.exe';
 await fs.access(path.join(outputDir,exeRel));
 overview.getRange('A19:F19').values=[['AD7682 Windows 串口上位机；实时曲线、设备设置、Flash 历史 CSV 导出',outputDir+'/AD7682/code/host/',outputDir+'/AD7682/code/host/app.py','app.py：界面\ndevice.py：串口与设备交互\nprotocol.py：校验与 CSV\ndatetime_picker.py：日期时间\ndemo.py：模拟设备','在 AD7682 根目录运行：\npython -m pip install -r code/host/requirements.txt\npython code/host/app.py\n演示：python code/host/app.py --demo',outputDir+'/'+exeRel]];
 overview.getRange('A21:F21').merge(); overview.getRange('A21').values=[['源码开发说明：AD7682/code/host/DEVELOPMENT.md；操作说明：AD7682/code/host/README.md。修改 Python 源码后，已有发布 EXE 不会自动更新，需要重新打包。']];

// 明细
 details.getRange('A1:D1').merge(); details.getRange('A1').values=[['程序与 PCB 关键文件明细']];
 details.getRange('A2:D2').merge(); details.getRange('A2').values=[['工程根目录：D:\\lwx\\lwx-project。以下路径相对于对应工程文件夹，列出程序入口、原理图、PCB 和说明文档。']];
 details.getRange('A4:D4').values=[['工程名称','类别','相对路径','用途说明']];
 details.getRange(`A5:D${4+detailsRows.length}`).values=detailsRows;

const titleFmt={font:{name:'Microsoft YaHei',size:16,bold:true,color:'#1F2937'},verticalAlignment:'center'};
const subtitleFmt={font:{name:'Microsoft YaHei',size:10,italic:true,color:'#5B6573'},verticalAlignment:'center',wrapText:true};
const headerFmt={fill:'#1F4E78',font:{name:'Microsoft YaHei',size:10,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',verticalAlignment:'center',wrapText:true};
const bodyFmt={font:{name:'Microsoft YaHei',size:10,color:'#1F2937'},verticalAlignment:'center',wrapText:true};
const sectionFmt={fill:'#D9EAF7',font:{name:'Microsoft YaHei',size:10,bold:true,color:'#1F2937'},verticalAlignment:'center'};
for (const s of [overview,details]) { s.getUsedRange().format.font={name:'Microsoft YaHei',size:10,color:'#1F2937'}; }
 overview.getRange('A1:F1').format=titleFmt; overview.getRange('A2:F2').format=subtitleFmt; overview.getRange('A4:F4').format=headerFmt; overview.getRange('A5:F13').format=bodyFmt;
 overview.getRange('A16:F16').format=sectionFmt; overview.getRange('A16:F16').format.rowHeight=30;
 overview.getRange('A18:F18').format=headerFmt; overview.getRange('A18:F18').format.rowHeight=30;
 overview.getRange('A19:F19').format=bodyFmt; overview.getRange('A19:F19').format.rowHeight=130;
 overview.getRange('A19:F19').format.borders={preset:'all',style:'thin',color:'#D9E2F3'};
 overview.getRange('A21:F21').format=subtitleFmt; overview.getRange('A21:F21').format.rowHeight=32;
 details.getRange('A1:D1').format=titleFmt; details.getRange('A2:D2').format=subtitleFmt; details.getRange('A4:D4').format=headerFmt; details.getRange(`A5:D${4+detailsRows.length}`).format=bodyFmt;
 overview.getRange('A4:F13').format.borders={preset:'all',style:'thin',color:'#D9E2F3'}; details.getRange(`A4:D${4+detailsRows.length}`).format.borders={preset:'all',style:'thin',color:'#D9E2F3'};
 overview.getRange('A1:F1').format.rowHeight=32; overview.getRange('A2:F2').format.rowHeight=28; overview.getRange('A4:F4').format.rowHeight=32; details.getRange('A1:D1').format.rowHeight=32; details.getRange('A2:D2').format.rowHeight=28; details.getRange('A4:D4').format.rowHeight=30;
 overview.getRange('A:A').format.columnWidth=29; overview.getRange('B:B').format.columnWidth=27; overview.getRange('C:C').format.columnWidth=44; overview.getRange('D:D').format.columnWidth=52; overview.getRange('E:E').format.columnWidth=55; overview.getRange('F:F').format.columnWidth=30;
 details.getRange('A:A').format.columnWidth=25; details.getRange('B:B').format.columnWidth=12; details.getRange('C:C').format.columnWidth=58; details.getRange('D:D').format.columnWidth=34;
 overview.freezePanes.freezeRows(4); details.freezePanes.freezeRows(4);
 overview.tables.add('A4:F13',true,'ProjectOverview'); details.tables.add(`A4:D${4+detailsRows.length}`,true,'ProjectFiles');
 overview.getRange('A5:F13').format.rowHeight=100;
 details.getRange(`A5:D${4+detailsRows.length}`).format.rowHeight=42;
 details.getRange('C:C').format.columnWidth=100;
 wb.recalculate();
 const inspect = await wb.inspect({kind:'table',range:'项目总览!A16:F21',include:'values,formulas',tableMaxRows:6,tableMaxCols:6,maxChars:8000});
 await fs.writeFile(buildDir+'/inspect.ndjson',inspect.ndjson ?? String(inspect));
 const err = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'公式错误检查'});
 await fs.writeFile(buildDir+'/errors.ndjson',err.ndjson ?? String(err));
 const preview = await wb.render({sheetName:'项目总览',autoCrop:'all',scale:1,format:'png'});
 await fs.writeFile(buildDir+'/项目总览预览.png',new Uint8Array(await preview.arrayBuffer()));
 const hostPreview=await wb.render({sheetName:'项目总览',range:'A16:F21',scale:1,format:'png'});
 await fs.writeFile(buildDir+'/上位机源码说明预览.png',new Uint8Array(await hostPreview.arrayBuffer()));
 const detailPreview=await wb.render({sheetName:'文件明细',range:'A1:D18',scale:1,format:'png'});
 await fs.writeFile(buildDir+'/文件明细预览.png',new Uint8Array(await detailPreview.arrayBuffer()));
 const output = await SpreadsheetFile.exportXlsx(wb);
 await output.save(outputDir+'/嵌入式程序与PCB工程清单.xlsx');
console.log('created', outputDir+'/嵌入式程序与PCB工程清单.xlsx');
