import { 
	MODEL_EVALUE,
	DOMAIN_EVALUE,
	LENGTH_THRESHOLD,
} from '../../Configs/OptionLabels';

const OptionData = {
	optionList: {
		entities: {
			basicOptions: {
				id: "basicOptions",
				summaryText: "Basic Options",
				defaultExpanded: true
			},
		},
		keys: ["basicOptions"]
	},
	basicOptions: {
		entities: {
			basicOption1: {
				id: "basicOption1",
				label: LENGTH_THRESHOLD,
				type: "number",
				defaultValue: 100,
				step: 1,
				min: 60,
				max: 300
			},
			basicOption2: {
				id: "basicOption2",
				label: MODEL_EVALUE,
				type: "number",
				defaultValue: 0.1,
				step: 0.01,
				min: 0,
				max: 10,
			},
			basicOption3: {
				id: "basicOption3",
				label: DOMAIN_EVALUE,
				type: "number",
				defaultValue: 0.1,
				step: 0.01,
				min: 0,
				max: 10,
			},
		},
		keys: ["basicOption1", "basicOption2", "basicOption3"]
	},
}

export default OptionData