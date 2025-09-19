// backend/index.ts

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamText, generateObject } from 'ai'
import { z } from 'zod'

// Initialize the app
const app = new Hono()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
)

// Welcome message
const welcomeStrings = [
  "Hello Hono!",
  "To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/hono ",
]

// Root endpoint
app.get('/', (c) => {
  return c.text(welcomeStrings.join('\n\n'))
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// Get random info endpoint
app.get('/random-info', async (c) => {
  try {
    // Use the AI Gateway by specifying the model creator and name
    const result = await streamText({
      model: 'cerebras/qwen-3-32b',
      prompt: 'Generate a random interesting fact about technology, science, or history.',
    })

    // Convert stream to text
    let content = '';
    for await (const textPart of result.textStream) {
      content += textPart;
    }

    return c.json({
      info: content,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching random info:', error)
    return c.json({
      error: 'Failed to generate random information',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Quiz data endpoint
app.get('/quiz', async (c) => {
  try {
    // Define schema for quiz data
    const QuizSchema = z.object({
      questions: z.array(
        z.object({
          question: z.string(),
          options: z.array(z.string()),
          correctAnswer: z.number().int().min(0),
          explanation: z.string().optional()
        })
      )
    })

    // Generate quiz data using the AI Gateway
    const { object } = await generateObject({
      model: 'cerebras/qwen-3-32b',
      schema: QuizSchema,
      prompt: 'Generate a quiz with 3 questions about web development. Each question should have 4 multiple choice options, indicate the correct answer with its index (0-3), and include a brief explanation.'
    })

    return c.json({
      quiz: object,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return c.json({
      error: 'Failed to generate quiz data',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// X OAuth token exchange endpoint (fixes CORS issues)
app.post('/api/oauth/token', async (c) => {
  try {
    const { code, codeVerifier, redirectUri } = await c.req.json()

    // Validate required fields
    if (!code || !codeVerifier || !redirectUri) {
      return c.json({
        error: 'Missing required fields: code, codeVerifier, redirectUri'
      }, 400)
    }

    // Get environment variables
    const CLIENT_ID = process.env.X_CLIENT_ID || process.env.VITE_X_CLIENT_ID
    const CLIENT_SECRET = process.env.X_CLIENT_SECRET
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('Missing X OAuth credentials in environment variables')
      return c.json({
        error: 'Server configuration error: Missing OAuth credentials'
      }, 500)
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        client_id: CLIENT_ID
      })
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('X API token exchange failed:', tokenData)
      return c.json({
        error: 'Token exchange failed',
        details: tokenData.error_description || tokenData.error
      }, tokenResponse.status as any)
    }

    // Return the token data to frontend
    return c.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope
    })

  } catch (error) {
    console.error('OAuth token exchange error:', error)
    return c.json({
      error: 'Internal server error during token exchange'
    }, 500)
  }
})

// X API proxy endpoints (avoid CORS for API calls)
app.get('/api/x/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return c.json({ error: 'Missing Authorization header' }, 401)
    }

    const userResponse = await fetch('https://api.x.com/2/users/me?user.fields=id,name,username,public_metrics,profile_image_url', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      return c.json({
        error: 'Failed to fetch user data',
        details: userData
      }, userResponse.status as any)
    }

    return c.json(userData)
  } catch (error) {
    console.error('X API user fetch error:', error)
    return c.json({
      error: 'Internal server error fetching user data'
    }, 500)
  }
})

export default app