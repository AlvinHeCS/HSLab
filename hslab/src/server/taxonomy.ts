// Math syllabus taxonomy: hierarchy enforcement for grade → topic → subtopic.
//
// Postgres enums (Grade, MathTopic, MathSubtopic) cannot enforce inter-column
// constraints, so this file is the single source of truth. Use these constants
// to:
//   - Drive cascading dropdowns in the admin upload form
//   - Validate question inserts via Zod (topic ∈ GRADE_TOPICS[grade], etc.)
//   - Render human-readable labels (TOPIC_LABELS, SUBTOPIC_LABELS) in UI

import { Grade, MathSubtopic, MathTopic } from "../../generated/prisma";

export const GRADE_TOPICS: Record<Grade, MathTopic[]> = {
  [Grade.Y7]: [
    MathTopic.Y7_NUMBER,
    MathTopic.Y7_ALGEBRA,
    MathTopic.Y7_MEASUREMENT_SPACE,
    MathTopic.Y7_STATS_PROBABILITY,
  ],
  [Grade.Y8]: [
    MathTopic.Y8_NUMBER,
    MathTopic.Y8_ALGEBRA,
    MathTopic.Y8_MEASUREMENT_SPACE,
    MathTopic.Y8_STATS_PROBABILITY,
  ],
  [Grade.Y9]: [
    MathTopic.Y9_NUMBER_ALGEBRA,
    MathTopic.Y9_MEASUREMENT_SPACE,
    MathTopic.Y9_STATS_PROBABILITY,
  ],
  [Grade.Y10]: [
    MathTopic.Y10_NUMBER_ALGEBRA,
    MathTopic.Y10_FUNCTIONS_POLYNOMIALS,
    MathTopic.Y10_MEASUREMENT_SPACE,
    MathTopic.Y10_STATS_PROBABILITY,
  ],
  [Grade.Y11_STANDARD]: [
    MathTopic.Y11_STD_ALGEBRA,
    MathTopic.Y11_STD_MEASUREMENT,
    MathTopic.Y11_STD_FINANCIAL_MATH,
    MathTopic.Y11_STD_STATISTICAL_ANALYSIS,
  ],
  [Grade.Y11_ADVANCED]: [
    MathTopic.Y11_ADV_FUNCTIONS,
    MathTopic.Y11_ADV_TRIG_FUNCTIONS,
    MathTopic.Y11_ADV_CALCULUS,
    MathTopic.Y11_ADV_EXP_LOG_FUNCTIONS,
    MathTopic.Y11_ADV_STATISTICAL_ANALYSIS,
  ],
  [Grade.Y11_EXT1]: [
    MathTopic.Y11_E1_FUNCTIONS,
    MathTopic.Y11_E1_TRIG_FUNCTIONS,
    MathTopic.Y11_E1_CALCULUS,
    MathTopic.Y11_E1_COMBINATORICS,
  ],
  [Grade.Y12_STANDARD2]: [
    MathTopic.Y12_STD2_ALGEBRA,
    MathTopic.Y12_STD2_MEASUREMENT,
    MathTopic.Y12_STD2_FINANCIAL_MATH,
    MathTopic.Y12_STD2_STATISTICAL_ANALYSIS,
    MathTopic.Y12_STD2_NETWORKS,
  ],
  [Grade.Y12_ADVANCED]: [
    MathTopic.Y12_ADV_FUNCTIONS,
    MathTopic.Y12_ADV_TRIG_FUNCTIONS,
    MathTopic.Y12_ADV_CALCULUS,
    MathTopic.Y12_ADV_FINANCIAL_MATH,
    MathTopic.Y12_ADV_STATISTICAL_ANALYSIS,
  ],
  [Grade.Y12_EXT1]: [
    MathTopic.Y12_E1_PROOF,
    MathTopic.Y12_E1_VECTORS,
    MathTopic.Y12_E1_TRIG_FUNCTIONS,
    MathTopic.Y12_E1_CALCULUS,
    MathTopic.Y12_E1_STATISTICAL_ANALYSIS,
  ],
  [Grade.Y12_EXT2]: [
    MathTopic.Y12_E2_PROOF,
    MathTopic.Y12_E2_VECTORS,
    MathTopic.Y12_E2_COMPLEX_NUMBERS,
    MathTopic.Y12_E2_CALCULUS,
    MathTopic.Y12_E2_MECHANICS,
  ],
};

export const TOPIC_SUBTOPICS: Record<MathTopic, MathSubtopic[]> = {
  // Y7
  [MathTopic.Y7_NUMBER]: [
    MathSubtopic.Y7_NUMBER_COMPUTATION_INTEGERS,
    MathSubtopic.Y7_NUMBER_FRACTIONS_DECIMALS_PERCENTAGES,
    MathSubtopic.Y7_NUMBER_INDICES,
  ],
  [MathTopic.Y7_ALGEBRA]: [
    MathSubtopic.Y7_ALGEBRA_TECHNIQUES,
    MathSubtopic.Y7_ALGEBRA_EQUATIONS,
  ],
  [MathTopic.Y7_MEASUREMENT_SPACE]: [
    MathSubtopic.Y7_MEASUREMENT_SPACE_LENGTH_AREA_VOLUME,
    MathSubtopic.Y7_MEASUREMENT_SPACE_TIME,
    MathSubtopic.Y7_MEASUREMENT_SPACE_ANGLE_RELATIONSHIPS,
  ],
  [MathTopic.Y7_STATS_PROBABILITY]: [
    MathSubtopic.Y7_STATS_PROBABILITY_DATA_COLLECTION,
    MathSubtopic.Y7_STATS_PROBABILITY_PROBABILITY,
  ],

  // Y8
  [MathTopic.Y8_NUMBER]: [
    MathSubtopic.Y8_NUMBER_RATIOS_RATES,
    MathSubtopic.Y8_NUMBER_FINANCIAL_MATH,
  ],
  [MathTopic.Y8_ALGEBRA]: [
    MathSubtopic.Y8_ALGEBRA_TECHNIQUES,
    MathSubtopic.Y8_ALGEBRA_EQUATIONS,
    MathSubtopic.Y8_ALGEBRA_LINEAR_RELATIONSHIPS,
  ],
  [MathTopic.Y8_MEASUREMENT_SPACE]: [
    MathSubtopic.Y8_MEASUREMENT_SPACE_PYTHAGORAS,
    MathSubtopic.Y8_MEASUREMENT_SPACE_GEOMETRICAL_FIGURES,
    MathSubtopic.Y8_MEASUREMENT_SPACE_LENGTH_AREA_VOLUME,
  ],
  [MathTopic.Y8_STATS_PROBABILITY]: [
    MathSubtopic.Y8_STATS_PROBABILITY_SINGLE_VAR_DATA,
    MathSubtopic.Y8_STATS_PROBABILITY_PROBABILITY,
  ],

  // Y9
  [MathTopic.Y9_NUMBER_ALGEBRA]: [
    MathSubtopic.Y9_NUMBER_ALGEBRA_INDICES,
    MathSubtopic.Y9_NUMBER_ALGEBRA_TECHNIQUES,
    MathSubtopic.Y9_NUMBER_ALGEBRA_LINEAR_RELATIONSHIPS,
    MathSubtopic.Y9_NUMBER_ALGEBRA_EQUATIONS,
    MathSubtopic.Y9_NUMBER_ALGEBRA_FINANCIAL_MATH,
  ],
  [MathTopic.Y9_MEASUREMENT_SPACE]: [
    MathSubtopic.Y9_MEASUREMENT_SPACE_SURFACE_AREA_VOLUME,
    MathSubtopic.Y9_MEASUREMENT_SPACE_TRIGONOMETRY,
    MathSubtopic.Y9_MEASUREMENT_SPACE_GEOMETRICAL_FIGURES,
  ],
  [MathTopic.Y9_STATS_PROBABILITY]: [
    MathSubtopic.Y9_STATS_PROBABILITY_SINGLE_VAR_DATA,
    MathSubtopic.Y9_STATS_PROBABILITY_PROBABILITY,
  ],

  // Y10
  [MathTopic.Y10_NUMBER_ALGEBRA]: [
    MathSubtopic.Y10_NUMBER_ALGEBRA_TECHNIQUES,
    MathSubtopic.Y10_NUMBER_ALGEBRA_EQUATIONS,
    MathSubtopic.Y10_NUMBER_ALGEBRA_LINEAR_RELATIONSHIPS,
    MathSubtopic.Y10_NUMBER_ALGEBRA_NON_LINEAR,
    MathSubtopic.Y10_NUMBER_ALGEBRA_LOGARITHMS,
  ],
  [MathTopic.Y10_FUNCTIONS_POLYNOMIALS]: [
    MathSubtopic.Y10_FUNCTIONS_POLYNOMIALS_FUNCTIONS_GRAPHS,
    MathSubtopic.Y10_FUNCTIONS_POLYNOMIALS_POLYNOMIALS,
  ],
  [MathTopic.Y10_MEASUREMENT_SPACE]: [
    MathSubtopic.Y10_MEASUREMENT_SPACE_SURFACE_AREA_VOLUME,
    MathSubtopic.Y10_MEASUREMENT_SPACE_TRIGONOMETRY,
    MathSubtopic.Y10_MEASUREMENT_SPACE_CIRCLE_GEOMETRY,
  ],
  [MathTopic.Y10_STATS_PROBABILITY]: [
    MathSubtopic.Y10_STATS_PROBABILITY_BIVARIATE,
    MathSubtopic.Y10_STATS_PROBABILITY_SINGLE_VAR,
    MathSubtopic.Y10_STATS_PROBABILITY_PROBABILITY,
  ],

  // Y11 Standard
  [MathTopic.Y11_STD_ALGEBRA]: [
    MathSubtopic.Y11_STD_ALGEBRA_FORMULAE_EQUATIONS,
    MathSubtopic.Y11_STD_ALGEBRA_LINEAR_RELATIONSHIPS,
  ],
  [MathTopic.Y11_STD_MEASUREMENT]: [
    MathSubtopic.Y11_STD_MEASUREMENT_APPLICATIONS,
    MathSubtopic.Y11_STD_MEASUREMENT_TIME,
  ],
  [MathTopic.Y11_STD_FINANCIAL_MATH]: [
    MathSubtopic.Y11_STD_FINANCIAL_MATH_MONEY_MATTERS,
  ],
  [MathTopic.Y11_STD_STATISTICAL_ANALYSIS]: [
    MathSubtopic.Y11_STD_STATISTICAL_ANALYSIS_DATA_ANALYSIS,
    MathSubtopic.Y11_STD_STATISTICAL_ANALYSIS_RELATIVE_FREQUENCY,
  ],

  // Y11 Advanced
  [MathTopic.Y11_ADV_FUNCTIONS]: [
    MathSubtopic.Y11_ADV_FUNCTIONS_WORKING_WITH,
    MathSubtopic.Y11_ADV_FUNCTIONS_QUADRATIC_RELATIONSHIPS,
    MathSubtopic.Y11_ADV_FUNCTIONS_INVERSE,
    MathSubtopic.Y11_ADV_FUNCTIONS_POLYNOMIALS,
  ],
  [MathTopic.Y11_ADV_TRIG_FUNCTIONS]: [
    MathSubtopic.Y11_ADV_TRIG_FUNCTIONS_TRIG_AND_ANGLES,
    MathSubtopic.Y11_ADV_TRIG_FUNCTIONS_FUNCTIONS_AND_IDENTITIES,
  ],
  [MathTopic.Y11_ADV_CALCULUS]: [
    MathSubtopic.Y11_ADV_CALCULUS_INTRO_DIFFERENTIATION,
  ],
  [MathTopic.Y11_ADV_EXP_LOG_FUNCTIONS]: [
    MathSubtopic.Y11_ADV_EXP_LOG_FUNCTIONS_LOGS_AND_EXPONENTIALS,
    MathSubtopic.Y11_ADV_EXP_LOG_FUNCTIONS_LOG_LAWS_EQUATIONS,
  ],
  [MathTopic.Y11_ADV_STATISTICAL_ANALYSIS]: [
    MathSubtopic.Y11_ADV_STATISTICAL_ANALYSIS_PROBABILITY_VENN,
    MathSubtopic.Y11_ADV_STATISTICAL_ANALYSIS_DISCRETE_PROBABILITY,
  ],

  // Y11 Extension 1
  [MathTopic.Y11_E1_FUNCTIONS]: [
    MathSubtopic.Y11_E1_FUNCTIONS_FURTHER_WORK,
    MathSubtopic.Y11_E1_FUNCTIONS_POLYNOMIALS,
    MathSubtopic.Y11_E1_FUNCTIONS_INVERSE,
  ],
  [MathTopic.Y11_E1_TRIG_FUNCTIONS]: [
    MathSubtopic.Y11_E1_TRIG_FUNCTIONS_INVERSE_TRIG,
    MathSubtopic.Y11_E1_TRIG_FUNCTIONS_FURTHER_IDENTITIES,
  ],
  [MathTopic.Y11_E1_CALCULUS]: [MathSubtopic.Y11_E1_CALCULUS_RATES_OF_CHANGE],
  [MathTopic.Y11_E1_COMBINATORICS]: [
    MathSubtopic.Y11_E1_COMBINATORICS_WORKING_WITH,
    MathSubtopic.Y11_E1_COMBINATORICS_BINOMIAL_EXPANSION,
  ],

  // Y12 Standard 2
  [MathTopic.Y12_STD2_ALGEBRA]: [
    MathSubtopic.Y12_STD2_ALGEBRA_TYPES_OF_RELATIONSHIPS,
    MathSubtopic.Y12_STD2_ALGEBRA_SIMULTANEOUS_LINEAR,
  ],
  [MathTopic.Y12_STD2_MEASUREMENT]: [
    MathSubtopic.Y12_STD2_MEASUREMENT_NON_RIGHT_ANGLED_TRIG,
    MathSubtopic.Y12_STD2_MEASUREMENT_RATES_RATIOS,
  ],
  [MathTopic.Y12_STD2_FINANCIAL_MATH]: [
    MathSubtopic.Y12_STD2_FINANCIAL_MATH_INVESTMENTS_LOANS,
    MathSubtopic.Y12_STD2_FINANCIAL_MATH_ANNUITIES,
  ],
  [MathTopic.Y12_STD2_STATISTICAL_ANALYSIS]: [
    MathSubtopic.Y12_STD2_STATISTICAL_ANALYSIS_BIVARIATE_DATA,
    MathSubtopic.Y12_STD2_STATISTICAL_ANALYSIS_NORMAL_DISTRIBUTION,
  ],
  [MathTopic.Y12_STD2_NETWORKS]: [
    MathSubtopic.Y12_STD2_NETWORKS_NETWORK_CONCEPTS,
    MathSubtopic.Y12_STD2_NETWORKS_CRITICAL_PATH,
  ],

  // Y12 Advanced
  [MathTopic.Y12_ADV_FUNCTIONS]: [
    MathSubtopic.Y12_ADV_FUNCTIONS_GRAPHING_TECHNIQUES,
  ],
  [MathTopic.Y12_ADV_TRIG_FUNCTIONS]: [
    MathSubtopic.Y12_ADV_TRIG_FUNCTIONS_GRAPHS,
  ],
  [MathTopic.Y12_ADV_CALCULUS]: [
    MathSubtopic.Y12_ADV_CALCULUS_DIFFERENTIAL,
    MathSubtopic.Y12_ADV_CALCULUS_SECOND_DERIVATIVE,
    MathSubtopic.Y12_ADV_CALCULUS_INTEGRAL,
  ],
  [MathTopic.Y12_ADV_FINANCIAL_MATH]: [
    MathSubtopic.Y12_ADV_FINANCIAL_MATH_MODELLING,
  ],
  [MathTopic.Y12_ADV_STATISTICAL_ANALYSIS]: [
    MathSubtopic.Y12_ADV_STATISTICAL_ANALYSIS_DESCRIPTIVE_BIVARIATE,
    MathSubtopic.Y12_ADV_STATISTICAL_ANALYSIS_RANDOM_VARIABLES,
    MathSubtopic.Y12_ADV_STATISTICAL_ANALYSIS_NORMAL_DISTRIBUTION,
  ],

  // Y12 Extension 1
  [MathTopic.Y12_E1_PROOF]: [MathSubtopic.Y12_E1_PROOF_INDUCTION],
  [MathTopic.Y12_E1_VECTORS]: [MathSubtopic.Y12_E1_VECTORS_INTRO],
  [MathTopic.Y12_E1_TRIG_FUNCTIONS]: [
    MathSubtopic.Y12_E1_TRIG_FUNCTIONS_EQUATIONS,
  ],
  [MathTopic.Y12_E1_CALCULUS]: [
    MathSubtopic.Y12_E1_CALCULUS_FURTHER_SKILLS,
    MathSubtopic.Y12_E1_CALCULUS_APPLICATIONS,
    MathSubtopic.Y12_E1_CALCULUS_DIFFERENTIAL_EQUATIONS,
  ],
  [MathTopic.Y12_E1_STATISTICAL_ANALYSIS]: [
    MathSubtopic.Y12_E1_STATISTICAL_ANALYSIS_BINOMIAL_DISTRIBUTION,
  ],

  // Y12 Extension 2
  [MathTopic.Y12_E2_PROOF]: [
    MathSubtopic.Y12_E2_PROOF_NATURE_OF_PROOF,
    MathSubtopic.Y12_E2_PROOF_FURTHER_INDUCTION,
  ],
  [MathTopic.Y12_E2_VECTORS]: [MathSubtopic.Y12_E2_VECTORS_FURTHER_WORK],
  [MathTopic.Y12_E2_COMPLEX_NUMBERS]: [
    MathSubtopic.Y12_E2_COMPLEX_NUMBERS_INTRO,
    MathSubtopic.Y12_E2_COMPLEX_NUMBERS_USING,
  ],
  [MathTopic.Y12_E2_CALCULUS]: [
    MathSubtopic.Y12_E2_CALCULUS_FURTHER_INTEGRATION,
  ],
  [MathTopic.Y12_E2_MECHANICS]: [MathSubtopic.Y12_E2_MECHANICS_APPLICATIONS],
};

// ─────────────────────────────────────────────────────────────────────────────
// Display labels (UI rendering)
// ─────────────────────────────────────────────────────────────────────────────

export const GRADE_LABELS: Record<Grade, string> = {
  [Grade.Y7]: "Year 7",
  [Grade.Y8]: "Year 8",
  [Grade.Y9]: "Year 9",
  [Grade.Y10]: "Year 10",
  [Grade.Y11_STANDARD]: "Year 11 Standard",
  [Grade.Y11_ADVANCED]: "Year 11 Advanced",
  [Grade.Y11_EXT1]: "Year 11 Extension 1",
  [Grade.Y12_STANDARD2]: "Year 12 Standard 2",
  [Grade.Y12_ADVANCED]: "Year 12 Advanced",
  [Grade.Y12_EXT1]: "Year 12 Extension 1",
  [Grade.Y12_EXT2]: "Year 12 Extension 2",
};

export const TOPIC_LABELS: Record<MathTopic, string> = {
  [MathTopic.Y7_NUMBER]: "Number",
  [MathTopic.Y7_ALGEBRA]: "Algebra",
  [MathTopic.Y7_MEASUREMENT_SPACE]: "Measurement and Space",
  [MathTopic.Y7_STATS_PROBABILITY]: "Statistics and Probability",
  [MathTopic.Y8_NUMBER]: "Number",
  [MathTopic.Y8_ALGEBRA]: "Algebra",
  [MathTopic.Y8_MEASUREMENT_SPACE]: "Measurement and Space",
  [MathTopic.Y8_STATS_PROBABILITY]: "Statistics and Probability",
  [MathTopic.Y9_NUMBER_ALGEBRA]: "Number and Algebra",
  [MathTopic.Y9_MEASUREMENT_SPACE]: "Measurement and Space",
  [MathTopic.Y9_STATS_PROBABILITY]: "Statistics and Probability",
  [MathTopic.Y10_NUMBER_ALGEBRA]: "Number and Algebra",
  [MathTopic.Y10_FUNCTIONS_POLYNOMIALS]: "Functions and Polynomials",
  [MathTopic.Y10_MEASUREMENT_SPACE]: "Measurement and Space",
  [MathTopic.Y10_STATS_PROBABILITY]: "Statistics and Probability",
  [MathTopic.Y11_STD_ALGEBRA]: "Algebra",
  [MathTopic.Y11_STD_MEASUREMENT]: "Measurement",
  [MathTopic.Y11_STD_FINANCIAL_MATH]: "Financial Mathematics",
  [MathTopic.Y11_STD_STATISTICAL_ANALYSIS]: "Statistical Analysis",
  [MathTopic.Y11_ADV_FUNCTIONS]: "Functions",
  [MathTopic.Y11_ADV_TRIG_FUNCTIONS]: "Trigonometric Functions",
  [MathTopic.Y11_ADV_CALCULUS]: "Calculus",
  [MathTopic.Y11_ADV_EXP_LOG_FUNCTIONS]: "Exponential and Logarithmic Functions",
  [MathTopic.Y11_ADV_STATISTICAL_ANALYSIS]: "Statistical Analysis",
  [MathTopic.Y11_E1_FUNCTIONS]: "Functions",
  [MathTopic.Y11_E1_TRIG_FUNCTIONS]: "Trigonometric Functions",
  [MathTopic.Y11_E1_CALCULUS]: "Calculus",
  [MathTopic.Y11_E1_COMBINATORICS]: "Combinatorics",
  [MathTopic.Y12_STD2_ALGEBRA]: "Algebra",
  [MathTopic.Y12_STD2_MEASUREMENT]: "Measurement",
  [MathTopic.Y12_STD2_FINANCIAL_MATH]: "Financial Mathematics",
  [MathTopic.Y12_STD2_STATISTICAL_ANALYSIS]: "Statistical Analysis",
  [MathTopic.Y12_STD2_NETWORKS]: "Networks",
  [MathTopic.Y12_ADV_FUNCTIONS]: "Functions",
  [MathTopic.Y12_ADV_TRIG_FUNCTIONS]: "Trigonometric Functions",
  [MathTopic.Y12_ADV_CALCULUS]: "Calculus",
  [MathTopic.Y12_ADV_FINANCIAL_MATH]: "Financial Mathematics",
  [MathTopic.Y12_ADV_STATISTICAL_ANALYSIS]: "Statistical Analysis",
  [MathTopic.Y12_E1_PROOF]: "Proof",
  [MathTopic.Y12_E1_VECTORS]: "Vectors",
  [MathTopic.Y12_E1_TRIG_FUNCTIONS]: "Trigonometric Functions",
  [MathTopic.Y12_E1_CALCULUS]: "Calculus",
  [MathTopic.Y12_E1_STATISTICAL_ANALYSIS]: "Statistical Analysis",
  [MathTopic.Y12_E2_PROOF]: "Proof",
  [MathTopic.Y12_E2_VECTORS]: "Vectors",
  [MathTopic.Y12_E2_COMPLEX_NUMBERS]: "Complex Numbers",
  [MathTopic.Y12_E2_CALCULUS]: "Calculus",
  [MathTopic.Y12_E2_MECHANICS]: "Mechanics",
};

export const SUBTOPIC_LABELS: Record<MathSubtopic, string> = {
  // Y7
  [MathSubtopic.Y7_NUMBER_COMPUTATION_INTEGERS]: "Computation with Integers",
  [MathSubtopic.Y7_NUMBER_FRACTIONS_DECIMALS_PERCENTAGES]: "Fractions, Decimals and Percentages",
  [MathSubtopic.Y7_NUMBER_INDICES]: "Indices",
  [MathSubtopic.Y7_ALGEBRA_TECHNIQUES]: "Algebraic Techniques",
  [MathSubtopic.Y7_ALGEBRA_EQUATIONS]: "Equations",
  [MathSubtopic.Y7_MEASUREMENT_SPACE_LENGTH_AREA_VOLUME]: "Length, Area and Volume",
  [MathSubtopic.Y7_MEASUREMENT_SPACE_TIME]: "Time",
  [MathSubtopic.Y7_MEASUREMENT_SPACE_ANGLE_RELATIONSHIPS]: "Angle Relationships",
  [MathSubtopic.Y7_STATS_PROBABILITY_DATA_COLLECTION]: "Data Collection and Representation",
  [MathSubtopic.Y7_STATS_PROBABILITY_PROBABILITY]: "Probability",
  // Y8
  [MathSubtopic.Y8_NUMBER_RATIOS_RATES]: "Ratios and Rates",
  [MathSubtopic.Y8_NUMBER_FINANCIAL_MATH]: "Financial Mathematics",
  [MathSubtopic.Y8_ALGEBRA_TECHNIQUES]: "Algebraic Techniques",
  [MathSubtopic.Y8_ALGEBRA_EQUATIONS]: "Equations",
  [MathSubtopic.Y8_ALGEBRA_LINEAR_RELATIONSHIPS]: "Linear Relationships",
  [MathSubtopic.Y8_MEASUREMENT_SPACE_PYTHAGORAS]: "Right-Angled Triangles (Pythagoras)",
  [MathSubtopic.Y8_MEASUREMENT_SPACE_GEOMETRICAL_FIGURES]: "Properties of Geometrical Figures",
  [MathSubtopic.Y8_MEASUREMENT_SPACE_LENGTH_AREA_VOLUME]: "Length, Area and Volume",
  [MathSubtopic.Y8_STATS_PROBABILITY_SINGLE_VAR_DATA]: "Single Variable Data Analysis",
  [MathSubtopic.Y8_STATS_PROBABILITY_PROBABILITY]: "Probability",
  // Y9
  [MathSubtopic.Y9_NUMBER_ALGEBRA_INDICES]: "Indices",
  [MathSubtopic.Y9_NUMBER_ALGEBRA_TECHNIQUES]: "Algebraic Techniques",
  [MathSubtopic.Y9_NUMBER_ALGEBRA_LINEAR_RELATIONSHIPS]: "Linear Relationships",
  [MathSubtopic.Y9_NUMBER_ALGEBRA_EQUATIONS]: "Equations",
  [MathSubtopic.Y9_NUMBER_ALGEBRA_FINANCIAL_MATH]: "Financial Mathematics",
  [MathSubtopic.Y9_MEASUREMENT_SPACE_SURFACE_AREA_VOLUME]: "Surface Area and Volume",
  [MathSubtopic.Y9_MEASUREMENT_SPACE_TRIGONOMETRY]: "Right-Angled Triangles (Trigonometry)",
  [MathSubtopic.Y9_MEASUREMENT_SPACE_GEOMETRICAL_FIGURES]: "Properties of Geometrical Figures",
  [MathSubtopic.Y9_STATS_PROBABILITY_SINGLE_VAR_DATA]: "Single Variable Data Analysis",
  [MathSubtopic.Y9_STATS_PROBABILITY_PROBABILITY]: "Probability",
  // Y10
  [MathSubtopic.Y10_NUMBER_ALGEBRA_TECHNIQUES]: "Algebraic Techniques",
  [MathSubtopic.Y10_NUMBER_ALGEBRA_EQUATIONS]: "Equations",
  [MathSubtopic.Y10_NUMBER_ALGEBRA_LINEAR_RELATIONSHIPS]: "Linear Relationships",
  [MathSubtopic.Y10_NUMBER_ALGEBRA_NON_LINEAR]: "Non-Linear Relationships",
  [MathSubtopic.Y10_NUMBER_ALGEBRA_LOGARITHMS]: "Logarithms",
  [MathSubtopic.Y10_FUNCTIONS_POLYNOMIALS_FUNCTIONS_GRAPHS]: "Functions and Other Graphs",
  [MathSubtopic.Y10_FUNCTIONS_POLYNOMIALS_POLYNOMIALS]: "Polynomials",
  [MathSubtopic.Y10_MEASUREMENT_SPACE_SURFACE_AREA_VOLUME]: "Surface Area and Volume",
  [MathSubtopic.Y10_MEASUREMENT_SPACE_TRIGONOMETRY]: "Trigonometry",
  [MathSubtopic.Y10_MEASUREMENT_SPACE_CIRCLE_GEOMETRY]: "Circle Geometry",
  [MathSubtopic.Y10_STATS_PROBABILITY_BIVARIATE]: "Bivariate Data Analysis",
  [MathSubtopic.Y10_STATS_PROBABILITY_SINGLE_VAR]: "Single Variable Data Analysis",
  [MathSubtopic.Y10_STATS_PROBABILITY_PROBABILITY]: "Probability",
  // Y11 Standard
  [MathSubtopic.Y11_STD_ALGEBRA_FORMULAE_EQUATIONS]: "Formulae and Equations",
  [MathSubtopic.Y11_STD_ALGEBRA_LINEAR_RELATIONSHIPS]: "Linear Relationships",
  [MathSubtopic.Y11_STD_MEASUREMENT_APPLICATIONS]: "Applications of Measurement",
  [MathSubtopic.Y11_STD_MEASUREMENT_TIME]: "Working with Time",
  [MathSubtopic.Y11_STD_FINANCIAL_MATH_MONEY_MATTERS]: "Money Matters",
  [MathSubtopic.Y11_STD_STATISTICAL_ANALYSIS_DATA_ANALYSIS]: "Data Analysis",
  [MathSubtopic.Y11_STD_STATISTICAL_ANALYSIS_RELATIVE_FREQUENCY]: "Relative Frequency and Probability",
  // Y11 Advanced
  [MathSubtopic.Y11_ADV_FUNCTIONS_WORKING_WITH]: "Working with Functions",
  [MathSubtopic.Y11_ADV_FUNCTIONS_QUADRATIC_RELATIONSHIPS]: "Quadratic Relationships",
  [MathSubtopic.Y11_ADV_FUNCTIONS_INVERSE]: "Inverse Functions",
  [MathSubtopic.Y11_ADV_FUNCTIONS_POLYNOMIALS]: "Polynomials",
  [MathSubtopic.Y11_ADV_TRIG_FUNCTIONS_TRIG_AND_ANGLES]: "Trigonometry and Measure of Angles",
  [MathSubtopic.Y11_ADV_TRIG_FUNCTIONS_FUNCTIONS_AND_IDENTITIES]: "Trigonometric Functions and Identities",
  [MathSubtopic.Y11_ADV_CALCULUS_INTRO_DIFFERENTIATION]: "Introduction to Differentiation",
  [MathSubtopic.Y11_ADV_EXP_LOG_FUNCTIONS_LOGS_AND_EXPONENTIALS]: "Logarithms and Exponentials",
  [MathSubtopic.Y11_ADV_EXP_LOG_FUNCTIONS_LOG_LAWS_EQUATIONS]: "Logarithmic Laws and Equations",
  [MathSubtopic.Y11_ADV_STATISTICAL_ANALYSIS_PROBABILITY_VENN]: "Probability and Venn Diagrams",
  [MathSubtopic.Y11_ADV_STATISTICAL_ANALYSIS_DISCRETE_PROBABILITY]: "Discrete Probability Distributions",
  // Y11 Extension 1
  [MathSubtopic.Y11_E1_FUNCTIONS_FURTHER_WORK]: "Further Work with Functions",
  [MathSubtopic.Y11_E1_FUNCTIONS_POLYNOMIALS]: "Polynomials",
  [MathSubtopic.Y11_E1_FUNCTIONS_INVERSE]: "Inverse Functions",
  [MathSubtopic.Y11_E1_TRIG_FUNCTIONS_INVERSE_TRIG]: "Inverse Trigonometric Functions",
  [MathSubtopic.Y11_E1_TRIG_FUNCTIONS_FURTHER_IDENTITIES]: "Further Trigonometric Identities",
  [MathSubtopic.Y11_E1_CALCULUS_RATES_OF_CHANGE]: "Rates of Change",
  [MathSubtopic.Y11_E1_COMBINATORICS_WORKING_WITH]: "Working with Combinatorics",
  [MathSubtopic.Y11_E1_COMBINATORICS_BINOMIAL_EXPANSION]: "Binomial Expansion",
  // Y12 Standard 2
  [MathSubtopic.Y12_STD2_ALGEBRA_TYPES_OF_RELATIONSHIPS]: "Types of Relationships",
  [MathSubtopic.Y12_STD2_ALGEBRA_SIMULTANEOUS_LINEAR]: "Simultaneous Linear Equations",
  [MathSubtopic.Y12_STD2_MEASUREMENT_NON_RIGHT_ANGLED_TRIG]: "Non-Right-Angled Trigonometry",
  [MathSubtopic.Y12_STD2_MEASUREMENT_RATES_RATIOS]: "Rates and Ratios",
  [MathSubtopic.Y12_STD2_FINANCIAL_MATH_INVESTMENTS_LOANS]: "Investments and Loans",
  [MathSubtopic.Y12_STD2_FINANCIAL_MATH_ANNUITIES]: "Annuities",
  [MathSubtopic.Y12_STD2_STATISTICAL_ANALYSIS_BIVARIATE_DATA]: "Bivariate Data Analysis",
  [MathSubtopic.Y12_STD2_STATISTICAL_ANALYSIS_NORMAL_DISTRIBUTION]: "The Normal Distribution",
  [MathSubtopic.Y12_STD2_NETWORKS_NETWORK_CONCEPTS]: "Network Concepts",
  [MathSubtopic.Y12_STD2_NETWORKS_CRITICAL_PATH]: "Critical Path Analysis",
  // Y12 Advanced
  [MathSubtopic.Y12_ADV_FUNCTIONS_GRAPHING_TECHNIQUES]: "Graphing Techniques",
  [MathSubtopic.Y12_ADV_TRIG_FUNCTIONS_GRAPHS]: "Trigonometric Functions and Graphs",
  [MathSubtopic.Y12_ADV_CALCULUS_DIFFERENTIAL]: "Differential Calculus",
  [MathSubtopic.Y12_ADV_CALCULUS_SECOND_DERIVATIVE]: "The Second Derivative",
  [MathSubtopic.Y12_ADV_CALCULUS_INTEGRAL]: "Integral Calculus",
  [MathSubtopic.Y12_ADV_FINANCIAL_MATH_MODELLING]: "Modelling Financial Situations",
  [MathSubtopic.Y12_ADV_STATISTICAL_ANALYSIS_DESCRIPTIVE_BIVARIATE]: "Descriptive Statistics and Bivariate Data Analysis",
  [MathSubtopic.Y12_ADV_STATISTICAL_ANALYSIS_RANDOM_VARIABLES]: "Random Variables",
  [MathSubtopic.Y12_ADV_STATISTICAL_ANALYSIS_NORMAL_DISTRIBUTION]: "The Normal Distribution",
  // Y12 Extension 1
  [MathSubtopic.Y12_E1_PROOF_INDUCTION]: "Proof by Mathematical Induction",
  [MathSubtopic.Y12_E1_VECTORS_INTRO]: "Introduction to Vectors",
  [MathSubtopic.Y12_E1_TRIG_FUNCTIONS_EQUATIONS]: "Trigonometric Equations",
  [MathSubtopic.Y12_E1_CALCULUS_FURTHER_SKILLS]: "Further Calculus Skills",
  [MathSubtopic.Y12_E1_CALCULUS_APPLICATIONS]: "Applications of Calculus",
  [MathSubtopic.Y12_E1_CALCULUS_DIFFERENTIAL_EQUATIONS]: "Differential Equations",
  [MathSubtopic.Y12_E1_STATISTICAL_ANALYSIS_BINOMIAL_DISTRIBUTION]: "The Binomial Distribution",
  // Y12 Extension 2
  [MathSubtopic.Y12_E2_PROOF_NATURE_OF_PROOF]: "The Nature of Proof",
  [MathSubtopic.Y12_E2_PROOF_FURTHER_INDUCTION]: "Further Proof by Induction",
  [MathSubtopic.Y12_E2_VECTORS_FURTHER_WORK]: "Further Work with Vectors",
  [MathSubtopic.Y12_E2_COMPLEX_NUMBERS_INTRO]: "Introduction to Complex Numbers",
  [MathSubtopic.Y12_E2_COMPLEX_NUMBERS_USING]: "Using Complex Numbers",
  [MathSubtopic.Y12_E2_CALCULUS_FURTHER_INTEGRATION]: "Further Integration",
  [MathSubtopic.Y12_E2_MECHANICS_APPLICATIONS]: "Applications of Calculus to Mechanics",
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────────────

export function isTopicValidForGrade(grade: Grade, topic: MathTopic): boolean {
  return GRADE_TOPICS[grade].includes(topic);
}

export function isSubtopicValidForTopic(topic: MathTopic, subtopic: MathSubtopic): boolean {
  return TOPIC_SUBTOPICS[topic].includes(subtopic);
}
