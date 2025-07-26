import { Snippet, User, TEC, PAC } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    auth0Id: 'auth0|1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    bio: 'Full-stack developer with a passion for clean code',
    avatar: '',
    createdSnippets: ['1', '2', '5', '8'],
    savedSnippets: ['3', '4', '6'],
    createdTECs: ['tec1', 'tec2', 'tec5'],
    createdPACs: ['pac1'],
    savedTECs: ['tec3', 'tec4'],
    savedPACs: ['pac2']
  },
  {
    id: '2',
    auth0Id: 'auth0|2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    bio: 'Frontend specialist, React enthusiast',
    createdSnippets: ['3', '4', '9'],
    savedSnippets: ['1', '2', '7'],
    createdTECs: ['tec3', 'tec4'],
    createdPACs: ['pac2'],
    savedTECs: ['tec1', 'tec2'],
    savedPACs: ['pac1']
  },
  {
    id: '3',
    auth0Id: 'auth0|3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    bio: 'Python developer and data scientist',
    createdSnippets: ['6', '7', '10'],
    savedSnippets: ['1', '5', '8'],
    createdTECs: ['tec6'],
    createdPACs: ['pac3'],
    savedTECs: ['tec1', 'tec5'],
    savedPACs: ['pac1']
  },
  {
    id: '4',
    auth0Id: 'auth0|4',
    name: 'David Wilson',
    email: 'david@example.com',
    bio: 'DevOps engineer, loves automation',
    createdSnippets: ['11', '12'],
    savedSnippets: ['2', '3', '9'],
    createdTECs: [],
    createdPACs: [],
    savedTECs: ['tec2', 'tec3'],
    savedPACs: []
  }
];

export const mockSnippets: Snippet[] = [
  {
    id: '1',
    title: 'React Functional Component Template',
    description: 'A basic template for creating functional components in React with TypeScript.',
    code: `import React from 'react';

interface Props {
  title: string;
  children?: React.ReactNode;
}

const MyComponent: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="component">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default MyComponent;`,
    language: 'typescript',
    tags: ['react', 'typescript', 'component'],
    authorId: '1',
    authorName: 'Alice Johnson',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isPublic: true
  },
  {
    id: '2',
    title: 'Python List Comprehension Examples',
    description: 'Demonstrates various list comprehensions in Python, including basic usage, conditions, and nested loops.',
    code: `# Basic list comprehension
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]

# With condition
even_squares = [x**2 for x in numbers if x % 2 == 0]

# Nested loops
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [item for row in matrix for item in row]

# Dictionary comprehension
word_lengths = {word: len(word) for word in ['hello', 'world', 'python']}`,
    language: 'python',
    tags: ['python', 'comprehension', 'tutorial'],
    authorId: '1',
    authorName: 'Alice Johnson',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    isPublic: true
  },
  {
    id: '3',
    title: 'CSS Flexbox Centering',
    description: 'A simple example of using Flexbox to center an item both vertically and horizontally within a container.',
    code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.centered-item {
  background: #f0f0f0;
  padding: 2rem;
  border-radius: 8px;
}`,
    language: 'css',
    tags: ['css', 'flexbox', 'centering'],
    authorId: '2',
    authorName: 'Bob Smith',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    isPublic: true
  },
  {
    id: '4',
    title: 'JavaScript Array Methods Cheat Sheet',
    description: 'A quick reference for common JavaScript array methods including map, filter, reduce, find, and more.',
    code: `const numbers = [1, 2, 3, 4, 5];

// Map - transform each element
const doubled = numbers.map(n => n * 2);

// Filter - select elements that match condition
const evens = numbers.filter(n => n % 2 === 0);

// Reduce - accumulate values
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Find - get first matching element
const found = numbers.find(n => n > 3);

// Some/Every - test conditions
const hasEven = numbers.some(n => n % 2 === 0);
const allPositive = numbers.every(n => n > 0);`,
    language: 'javascript',
    tags: ['javascript', 'arrays', 'methods'],
    authorId: '2',
    authorName: 'Bob Smith',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    isPublic: true
  },
  {
    id: '5',
    title: 'Express.js Basic Server Setup',
    description: 'A simple Express.js server setup with CORS and basic routes.',
    code: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to my API!' });
});

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    language: 'javascript',
    tags: ['nodejs', 'express', 'server'],
    authorId: '1',
    authorName: 'Alice Johnson',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    isPublic: false
  },
  {
    id: '6',
    title: 'Python Data Analysis Starter',
    description : 'A basic example of data analysis using pandas, including loading data, handling missing values, and simple visualizations.',
    code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load data
df = pd.read_csv('data.csv')

# Basic info
print(df.info())
print(df.describe())

# Handle missing values
df_clean = df.dropna()

# Group by and aggregate
summary = df_clean.groupby('category').agg({
    'value': ['mean', 'sum', 'count']
})

# Simple visualization
plt.figure(figsize=(10, 6))
df_clean['value'].hist(bins=20)
plt.title('Distribution of Values')
plt.show()`,
    language: 'python',
    tags: ['python', 'pandas', 'data-analysis'],
    authorId: '3',
    authorName: 'Carol Davis',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    isPublic: true
  },
  {
    id: '7',
    title: 'SQL Join Examples',
    description : 'Demonstrates inner join, left join, and aggregate queries with group by in SQL.',
    code: `-- Inner Join
SELECT u.name, o.order_date, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- Left Join
SELECT u.name, o.order_date, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- Aggregate with Group By
SELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY total_spent DESC;`,
    language: 'sql',
    tags: ['sql', 'joins', 'database'],
    authorId: '3',
    authorName: 'Carol Davis',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isPublic: true
  },
  {
    id: '8',
    title: 'Docker Compose for Development',
    description: 'A Docker Compose file for setting up a Node.js application with PostgreSQL for development.',
    code: `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`,
    language: 'yaml',
    tags: ['docker', 'compose', 'development'],
    authorId: '1',
    authorName: 'Alice Johnson',
    createdAt: new Date('2023-12-28'),
    updatedAt: new Date('2023-12-28'),
    isPublic: true
  },
  {
    id: '9',
    title: 'React Custom Hook for API',
    description: 'A custom React hook for fetching data from an API with loading and error states.',
    code: `import { useState, useEffect } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}

export default useApi;`,
    language: 'typescript',
    tags: ['react', 'hooks', 'api'],
    authorId: '2',
    authorName: 'Bob Smith',
    createdAt: new Date('2023-12-25'),
    updatedAt: new Date('2023-12-25'),
    isPublic: true
  },
  {
    id: '10',
    title: 'Python Async/Await Example',
    description: 'An example of using async/await in Python to fetch multiple URLs concurrently using aiohttp.',
    code: `import asyncio
import aiohttp
import time

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.text()

async def fetch_multiple_urls(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results

async def main():
    urls = [
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/2',
        'https://httpbin.org/delay/1'
    ]
    
    start_time = time.time()
    results = await fetch_multiple_urls(urls)
    end_time = time.time()
    
    print(f"Fetched {len(results)} URLs in {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(main())`,
    language: 'python',
    tags: ['python', 'async', 'aiohttp'],
    authorId: '3',
    authorName: 'Carol Davis',
    createdAt: new Date('2023-12-22'),
    updatedAt: new Date('2023-12-22'),
    isPublic: true
  }
];

export const getCurrentUser = (): User | null => {
  return mockUsers[0]; // For now, return Alice as the current user
};

export const getSnippetById = (id: string): Snippet | undefined => {
  return mockSnippets.find(snippet => snippet.id === id);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id || user.auth0Id === id);
};

// Mock TEC data
export const mockTECs: TEC[] = [
  {
    _id: 'tec1',
    title: 'React Functional Component Template',
    description: 'A basic template for creating functional components in React with TypeScript.',
    content: `import React from 'react';

interface Props {
  title: string;
  children?: React.ReactNode;
}

const MyComponent: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="component">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default MyComponent;`,
    language: 'typescript',
    tags: ['react', 'typescript', 'component'],
    author: 'auth0|1',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    isPublic: true
  },
  {
    _id: 'tec2',
    title: 'Python List Comprehension Examples',
    description: 'Demonstrates various list comprehensions in Python, including basic usage, conditions, and nested loops.',
    content: `# Basic list comprehension
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]

# With condition
even_squares = [x**2 for x in numbers if x % 2 == 0]

# Nested loops
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [item for row in matrix for item in row]

# Dictionary comprehension
word_lengths = {word: len(word) for word in ['hello', 'world', 'python']}`,
    language: 'python',
    tags: ['python', 'comprehension', 'tutorial'],
    author: 'auth0|1',
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
    isPublic: true
  },
  {
    _id: 'tec3',
    title: 'CSS Flexbox Centering',
    description: 'A simple example of using Flexbox to center an item both vertically and horizontally within a container.',
    content: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.centered-item {
  background: #f0f0f0;
  padding: 2rem;
  border-radius: 8px;
}`,
    language: 'css',
    tags: ['css', 'flexbox', 'centering'],
    author: 'auth0|2',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    isPublic: true
  },
  {
    _id: 'tec4',
    title: 'JavaScript Array Methods Cheat Sheet',
    description: 'A quick reference for common JavaScript array methods including map, filter, reduce, find, and more.',
    content: `const numbers = [1, 2, 3, 4, 5];

// Map - transform each element
const doubled = numbers.map(n => n * 2);

// Filter - select elements that match condition
const evens = numbers.filter(n => n % 2 === 0);

// Reduce - accumulate values
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Find - get first matching element
const found = numbers.find(n => n > 3);

// Some/Every - test conditions
const hasEven = numbers.some(n => n % 2 === 0);
const allPositive = numbers.every(n => n > 0);`,
    language: 'javascript',
    tags: ['javascript', 'arrays', 'methods'],
    author: 'auth0|2',
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z',
    isPublic: true
  },
  {
    _id: 'tec5',
    title: 'Express.js Basic Server Setup',
    description: 'A simple Express.js server setup with CORS and basic routes.',
    content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to my API!' });
});

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    language: 'javascript',
    tags: ['nodejs', 'express', 'server'],
    author: 'auth0|1',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
    isPublic: false
  },
  {
    _id: 'tec6',
    title: 'Python Data Analysis Starter',
    description: 'A basic example of data analysis using pandas, including loading data, handling missing values, and simple visualizations.',
    content: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load data
df = pd.read_csv('data.csv')

# Basic info
print(df.info())
print(df.describe())

# Handle missing values
df_clean = df.dropna()

# Group by and aggregate
summary = df_clean.groupby('category').agg({
    'value': ['mean', 'sum', 'count']
})

# Simple visualization
plt.figure(figsize=(10, 6))
df_clean['value'].hist(bins=20)
plt.title('Distribution of Values')
plt.show()`,
    language: 'python',
    tags: ['python', 'pandas', 'data-analysis'],
    author: 'auth0|3',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    isPublic: true
  }
];

// Mock PAC data
export const mockPACs: PAC[] = [
  {
    _id: 'pac1',
    name: 'React Component Library',
    description: 'A collection of reusable React components with TypeScript support',
    dependencies: ['react', 'typescript', '@types/react'],
    files: ['Button.tsx', 'Input.tsx', 'Modal.tsx', 'index.ts'],
    author: 'auth0|1',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    _id: 'pac2',
    name: 'CSS Utilities Package',
    description: 'A package of useful CSS utilities and helper classes',
    dependencies: ['postcss', 'autoprefixer'],
    files: ['utilities.css', 'variables.css', 'mixins.css'],
    author: 'auth0|2',
    createdAt: '2024-01-18T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    _id: 'pac3',
    name: 'Python Data Tools',
    description: 'A collection of Python utilities for data processing and analysis',
    dependencies: ['pandas', 'numpy', 'matplotlib'],
    files: ['data_loader.py', 'cleaner.py', 'visualizer.py', '__init__.py'],
    author: 'auth0|3',
    createdAt: '2024-01-16T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z'
  }
];

// Helper functions for TECs and PACs
export const getTECById = (id: string): TEC | undefined => {
  return mockTECs.find(tec => tec._id === id);
};

export const getPACById = (id: string): PAC | undefined => {
  return mockPACs.find(pac => pac._id === id);
};

export const getAllItems = (): (TEC | PAC)[] => {
  return [...mockTECs, ...mockPACs];
};