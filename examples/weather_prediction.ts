import { Recipe, Step, Truth } from '../src';

/**
 * TaaS Recipe: Weather Prediction Market
 */
export const recipe = Recipe.define({
    name: "City Temperature Prediction",
    description: "Determines if a city's temperature exceeds a threshold on a certain date.",
    category: "WEATHER",
    outcomeType: "BINARY",
    inputs: {
        city: Step.input.string("Target City")
            .renderAs("dynamic-search")
            .source("discovery.city")
            .hint("Pick from supported major cities worldwide"),

        temperatureThreshold: Step.input.number("Threshold (°C)")
            .renderAs("slider")
            .placeholder("35")
            .hint("Enter the temperature threshold to trigger this market"),

        observationDate: Step.input.date("Observation Date")
            .renderAs("date")
            .hint("When should the temperature be measured?")
    }
})
    .handler(async (inputs) => {
        const temp = await (Truth as any).weather.tempAt({
            location: inputs.city,
            date: inputs.observationDate
        });

        return Step.logic.condition(`\${${temp}} >= \${${inputs.temperatureThreshold}}`, ['true'], ['false']);
    });

export default recipe;
