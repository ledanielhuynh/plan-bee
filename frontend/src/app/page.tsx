'use client';

import { useEffect, useState } from 'react';
import { Field, Label, Input, Description } from '@headlessui/react';
import clsx from 'clsx';

export default function RootPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', tag: '', username: '', password: '' });
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setForm({ email: '', tag: '', username: '', password: '' });
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin
      ? { identifier: form.email || form.tag, password: form.password }
      : { email: form.email, tag: form.tag, username: form.username, password: form.password };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setMessage('Sorry, there was a problem with the server response. Please try again later.');
        return;
      }

      if (!res.ok) {
        setMessage(
          data?.message
            ? data.message
            : 'Something went wrong. Please check your input and try again.'
        );
        return;
      }

      setMessage(data.message || 'Success!');
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err: any) {
      setMessage(
        'Network error: Unable to reach the server. Please check your connection or try again later.'
      );
    }
  };

  // Bee mascot color palette
  const beeColors = {
    yellow: '#FFD966',
    brown: '#4B2E05',
    light: '#F6E1A7',
    gray: '#B3B3B3',
    black: '#222222',
    white: '#fff',
  };

  // Geometric pattern for right side (desktop only)
  function Pattern() {
    return (
      <div className="hidden md:flex flex-1 h-full items-center justify-center" style={{ background: beeColors.black }}>
        <div className="grid grid-cols-4 grid-rows-4 gap-0 w-full h-full">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-full h-full flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80 Q80 0 80 80 Z" fill={beeColors.yellow} />
              </svg>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#222222]">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md px-4">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/bee-mascot.png" alt="Bee Mascot" className="w-14 h-14" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Bee_icon.png'; }} />
          </div>
          {!token ? (
            <div className="bg-[#222222] rounded-lg w-full">
              <h1 className="font-tsukimi text-2xl text-center mb-2 text-white font-bold">
                Welcome back!
              </h1>
              <div className="text-center text-sm mb-6 text-white/70">
                Don't have an account yet?{' '}
                <button
                  className="font-medium hover:underline"
                  style={{ color: beeColors.yellow }}
                  onClick={() => setIsLogin(false)}
                  type="button"
                >
                  Sign up now
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isLogin ? (
                  <Field>
                    <Input
                      name="email"
                      type="text"
                      placeholder="Username or email"
                      value={form.email}
                      onChange={handleChange}
                      className={clsx(
                        'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                        'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                      )}
                      required
                    />
                  </Field>
                ) : (
                  <>
                    <Field>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={handleChange}
                        className={clsx(
                          'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                          'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                        )}
                        required
                      />
                    </Field>
                    <Field>
                      <Input
                        name="tag"
                        type="text"
                        placeholder="User Tag"
                        value={form.tag}
                        onChange={handleChange}
                        className={clsx(
                          'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                          'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                        )}
                        required
                      />
                    </Field>
                    <Field>
                      <Input
                        name="username"
                        type="text"
                        placeholder="Display Name"
                        value={form.username}
                        onChange={handleChange}
                        className={clsx(
                          'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                          'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                        )}
                        required
                      />
                    </Field>
                  </>
                )}
                <Field>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className={clsx(
                      'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                      'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                    )}
                    required
                  />
                </Field>
                <div className="flex items-center justify-between text-sm mt-2">
                  <label className="flex items-center gap-2 select-none text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe((v) => !v)}
                      className="accent-yellow-300"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="hover:underline text-white"
                    style={{ color: beeColors.yellow }}
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-lg shadow-sm transition mt-2"
                  style={{
                    background: beeColors.yellow,
                    color: beeColors.brown,
                  }}
                >
                  {isLogin ? "Log in" : "Sign up"}
                </button>
              </form>
              <div className="mt-4 text-center min-h-[24px]">
                {message && (
                  <span className="text-red-400 text-sm">{message}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#222222] rounded-lg w-full flex flex-col items-center">
              <h1 className="font-tsukimi text-3xl text-center text-white font-tsukimi">
                Welcome to Plan Bee! 🐝
              </h1>
              <p className="mb-4 text-center text-white">
                You are logged in!
              </p>
              {user && (
                <div className="mb-4 text-center text-white">
                  <div>
                    <strong>Tag:</strong> {user.tag}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Name:</strong> {user.username}
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full font-bold py-2 rounded-lg transition mt-2"
                style={{
                  background: beeColors.brown,
                  color: beeColors.yellow,
                  border: `2px solid ${beeColors.brown}`,
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Right: Pattern (desktop only) */}
      <Pattern />
    </div>
  );
}