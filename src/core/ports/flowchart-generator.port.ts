import { FlowchartData } from "@/core/domain/flowchart.entity";

export default interface IFlowchartGenerator {
  generate(text: string, mode?: "news" | "general"): Promise<FlowchartData>;
}
