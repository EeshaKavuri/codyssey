import { ArrayVisualizer, LinkedListVisualizer, StackVisualizer, WindowVisualizer } from './DsaVisualizers'
import {
  BacktrackingVisualizer, BinarySearchVisualizer, DynamicProgrammingVisualizer, GraphVisualizer,
  GreedyVisualizer, HeapVisualizer, KmpVisualizer, TreeVisualizer,
} from './AdvancedDsaVisualizers'

const visualizers = [
  LinkedListVisualizer, ArrayVisualizer, StackVisualizer, WindowVisualizer,
  TreeVisualizer, HeapVisualizer, GraphVisualizer, BacktrackingVisualizer,
  BinarySearchVisualizer, DynamicProgrammingVisualizer, GreedyVisualizer, KmpVisualizer,
]

export default function DsaExperiment({ week, onProgress }: { week: number; onProgress: () => void }) {
  const Visualizer = visualizers[week - 1]
  if (!Visualizer) throw new Error(`No DSA visualizer exists for week ${week}.`)
  return <Visualizer onProgress={onProgress} />
}
