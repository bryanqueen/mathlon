export interface TeachingStep {
  explanation: string;
  canvasContent: string;
  duration: number;
}

export function generateTeachingResponse(userMessage: string): TeachingStep[] {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('quadratic') || lowerMessage.includes('x²') || lowerMessage.includes('x^2') || lowerMessage.includes('parabola')) {
    return [
      {
        explanation: "Great! Let's learn about quadratic equations. A quadratic equation has the general form ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0.",
        canvasContent: "ax² + bx + c = 0\na ≠ 0\n[DIAGRAM:PARABOLA]",
        duration: 3000,
      },
      {
        explanation: "To solve quadratic equations, we can use the quadratic formula. This powerful formula works for any quadratic equation!",
        canvasContent: "x = (-b ± √(b² - 4ac)) / 2a\n→ Quadratic Formula\n[DIAGRAM:PARABOLA]",
        duration: 4000,
      },
      {
        explanation: "Let's try an example: x² - 5x + 6 = 0. Here, a = 1, b = -5, and c = 6.",
        canvasContent: "x² - 5x + 6 = 0\na = 1, b = -5, c = 6\n[DIAGRAM:COORDINATE]",
        duration: 3000,
      },
      {
        explanation: "Now we substitute into the formula and find the roots:",
        canvasContent: "x = (5 ± √(25 - 24)) / 2\nx = (5 ± 1) / 2\n→ x = 3 or x = 2",
        duration: 4000,
      },
    ];
  }

  if (lowerMessage.includes('derivative') || lowerMessage.includes('calculus')) {
    return [
      {
        explanation: "Let's explore derivatives! A derivative measures how a function changes as its input changes. It's the rate of change!",
        canvasContent: "f'(x) = lim[h→0] (f(x+h) - f(x)) / h\n[DIAGRAM:COORDINATE]",
        duration: 4000,
      },
      {
        explanation: "For example, the derivative of x² is 2x. This means the slope of x² at any point x is 2x.",
        canvasContent: "f(x) = x²\nf'(x) = 2x\n→ Power Rule: d/dx(xⁿ) = nxⁿ⁻¹\n[DIAGRAM:PARABOLA]",
        duration: 4000,
      },
    ];
  }

  if (lowerMessage.includes('pythagorean') || lowerMessage.includes('triangle')) {
    return [
      {
        explanation: "The Pythagorean theorem is one of the most famous theorems in mathematics! It relates the sides of a right triangle.",
        canvasContent: "a² + b² = c²\nwhere c is the hypotenuse\n[DIAGRAM:TRIANGLE]",
        duration: 3000,
      },
      {
        explanation: "For example, if a = 3 and b = 4, we can find c:",
        canvasContent: "3² + 4² = c²\n9 + 16 = c²\n25 = c²\n→ c = 5\n[DIAGRAM:TRIANGLE]",
        duration: 4000,
      },
    ];
  }

  if (lowerMessage.includes('sin') || lowerMessage.includes('cos') || lowerMessage.includes('trigonometry')) {
    return [
      {
        explanation: "Trigonometry studies the relationships between angles and sides of triangles. Let's look at the basic trig functions!",
        canvasContent: "sin(θ) = opposite / hypotenuse\ncos(θ) = adjacent / hypotenuse\ntan(θ) = opposite / adjacent\n[DIAGRAM:CIRCLE]",
        duration: 4000,
      },
      {
        explanation: "Here's a graph showing how sin(x) behaves. Notice it oscillates between -1 and 1!",
        canvasContent: "sin(x) oscillates\nbetween -1 and 1\n[DIAGRAM:SINE]",
        duration: 3000,
      },
    ];
  }

  return [
    {
      explanation: "That's an interesting question! Let me break it down for you step by step. In mathematics, we always start by understanding what we know and what we need to find.",
      canvasContent: "Given: Your question\nFind: The solution",
      duration: 3000,
    },
    {
      explanation: "The key is to approach problems systematically. Identify the knowns, the unknowns, and the relationships between them.",
      canvasContent: "Step 1: Identify knowns\nStep 2: Identify unknowns\nStep 3: Find relationships\n→ Solve!",
      duration: 4000,
    },
  ];
}

export function getQuickResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('quadratic')) {
    return "Excellent! Quadratic equations are fundamental in algebra. Let me show you how to master them!";
  }

  if (lowerMessage.includes('derivative') || lowerMessage.includes('calculus')) {
    return "Calculus is beautiful! Let's break down derivatives into simple, understandable steps.";
  }

  if (lowerMessage.includes('pythagorean') || lowerMessage.includes('triangle')) {
    return "The Pythagorean theorem is a classic! Let's explore it together.";
  }

  if (lowerMessage.includes('sin') || lowerMessage.includes('cos') || lowerMessage.includes('trigonometry')) {
    return "Trigonometry can seem tricky at first, but I'll make it crystal clear!";
  }

  return "Great question! Let me teach you this concept step by step. Feel free to interrupt if you need clarification!";
}
