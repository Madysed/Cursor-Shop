'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { Poppins } from 'next/font/google'

// Initialize the Poppins font
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  element: HTMLDivElement
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState<Particle[]>([])
  const [error, setError] = useState({
    email: '',
    password: ''
  })

  const updateParticles = useCallback(() => {
    particles.forEach(particle => {
      // Base movement - continue normal motion
      particle.x += particle.speedX
      particle.y += particle.speedY
      
      // Extremely subtle random movement
      particle.speedX += (Math.random() - 0.5) * 0.01
      particle.speedY += (Math.random() - 0.5) * 0.01
      
      // Apply very gentle speed limits
      particle.speedX = Math.min(Math.max(particle.speedX, -0.3), 0.3)
      particle.speedY = Math.min(Math.max(particle.speedY, -0.3), 0.3)
      
      // Bounce off walls with very reduced bounce force
      if (particle.x <= 0 || particle.x >= window.innerWidth) {
        particle.speedX *= -0.3
        particle.x = Math.max(0, Math.min(particle.x, window.innerWidth))
      }
      if (particle.y <= 0 || particle.y >= window.innerHeight) {
        particle.speedY *= -0.3
        particle.y = Math.max(0, Math.min(particle.y, window.innerHeight))
      }
      
      // Update DOM element
      particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`
    })
    
    requestAnimationFrame(updateParticles)
  }, [particles])

  useEffect(() => {
    createParticles()
    
    // Track mouse position for glow effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useEffect(() => {
    requestAnimationFrame(updateParticles)
  }, [updateParticles])

  const createParticles = () => {
    const particlesContainer = document.getElementById('particles')
    if (!particlesContainer) return

    // Clear existing particles
    particlesContainer.innerHTML = ''
    const newParticles: Particle[] = []

    // Create new particles
    for (let i = 0; i < 100; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      
      const size = Math.random() * 6 + 3 // 3-9px size
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      
      particle.style.transform = `translate(${x}px, ${y}px)`
      
      particlesContainer.appendChild(particle)
      
      newParticles.push({
        x,
        y,
        size,
        speedX: (Math.random() - 0.5) * 0.2, // Extremely slow initial speed
        speedY: (Math.random() - 0.5) * 0.2,
        element: particle
      })
    }
    
    setParticles(newParticles)
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError({ email: '', password: '' })

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate inputs
    let isValid = true
    if (!email || !validateEmail(email)) {
      setError(prev => ({ ...prev, email: 'Please enter a valid email' }))
      isValid = false
    }
    if (!password || password.length < 6) {
      setError(prev => ({ ...prev, password: 'Password must be at least 6 characters' }))
      isValid = false
    }

    if (!isValid) {
      setLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
      } else {
        toast.success('Successfully logged in!')
        router.push('/admin')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        * {
          font-family: ${poppins.style.fontFamily}, sans-serif;
          transition: all 0.3s ease;
        }
        
        body {
          background: linear-gradient(135deg, #1a1c2d 0%, #0f1629 100%);
          min-height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .mouse-glow {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: radial-gradient(
            circle 200px at var(--mouse-x) var(--mouse-y),
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0) 100%
          );
          z-index: 1;
        }
        
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        
        .particle {
          position: absolute;
          background: rgba(0, 0, 0, 0.8); 
          border-radius: 50%;
          pointer-events: none;
          will-change: transform;
          transition: none;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
        }
        
        .input-group {
          position: relative;
          margin-bottom: 1.5rem;
        }
        
        .input-group input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 50px;
          border: 2px solid #2d3748;
          outline: none;
          background: rgba(15, 22, 41, 0.95);
          color: #fff;
          padding-right: 3rem;
        }
        
        .input-group input:focus {
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3);
        }
        
        .input-group i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #63b3ed;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #63b3ed;
          cursor: pointer;
          z-index: 2;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s ease;
          background: rgba(99, 179, 237, 0.1);
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: #4299e1;
          background: rgba(66, 153, 225, 0.2);
        }

        .btn-primary {
          background: linear-gradient(to right, #3182ce, #2b6cb0);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 50px;
          width: 100%;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(49, 130, 206, 0.4);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(49, 130, 206, 0.6);
        }
        
        .error-message {
          color: #fc8181;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        
        .input-error {
          border-color: #fc8181 !important;
        }

        .login-container {
          position: relative;
          z-index: 2;
          backdrop-filter: blur(10px);
          background: rgba(26, 32, 44, 0.8);
          border: 1px solid rgba(99, 179, 237, 0.2);
        }

        .profile-icon {
          color: #93c5fd;
          width: 80px;
          height: 80px;
          margin-bottom: 1rem;
        }
      `}</style>

      <div 
        className="mouse-glow" 
        style={{ 
          '--mouse-x': `${mousePosition.x}px`, 
          '--mouse-y': `${mousePosition.y}px` 
        } as React.CSSProperties} 
      />
      
      <div className="particles" id="particles"></div>
      
      <div className="w-full max-w-md mx-4">
        <div className="login-container rounded-2xl shadow-2xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-blue-300/10 flex items-center justify-center">
                <svg 
                  className="w-16 h-16 text-blue-300" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-blue-300">Admin Panel</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className={error.email ? 'input-error' : ''}
                required
                autoComplete="email"
              />
              {error.email && (
                <div className="error-message">{error.email}</div>
              )}
            </div>
            
            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className={error.password ? 'input-error' : ''}
                required
                minLength={6}
                autoComplete="current-password"
              />
              <div 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </div>
              {error.password && (
                <div className="error-message">{error.password}</div>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <input type="checkbox" id="rememberMe" name="rememberMe" className="mr-2" autoComplete="remember-me" />
                <label htmlFor="rememberMe" className="text-sm text-blue-200">Remember me</label>
              </div>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>
            
            <button
              type="submit"
              className="btn-primary mb-6"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
} 