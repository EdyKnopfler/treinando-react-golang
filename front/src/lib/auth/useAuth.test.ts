import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth, type LoggedUser } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL;

const USER_ID = 1;
const USER_NAME = 'ZimTom';
const VALID_USERNAME = 'ZimTom';
const VALID_PASSWORD = 'GÔRDO';
const WRONG_USERNAME = 'errado';
const WRONG_PASSWORD = 'errado';

function makeUser(accessToken: string): LoggedUser {
  return { id: USER_ID, name: USER_NAME, accessToken };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function emptyResponse(status: number) {
  return new Response(null, { status });
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('faz bootstrap via /refresh ao montar e mantém o usuário nulo se o cookie não for válido', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(emptyResponse(401));

    const { result } = renderHook(() => useAuth());
    expect(result.current.initializing).toBe(true);

    await waitFor(() => expect(result.current.initializing).toBe(false));

    expect(result.current.user).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/refresh`,
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    );
  });

  it('restaura a sessão quando o /refresh inicial retorna um usuário válido', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse(makeUser('tok-1')));

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.initializing).toBe(false));

    expect(result.current.user).toEqual(makeUser('tok-1'));
  });

  it('login: sucesso guarda o usuário; falha retorna false sem lançar', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(emptyResponse(401)); // bootstrap sem sessão

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.initializing).toBe(false));

    fetchMock.mockResolvedValueOnce(emptyResponse(401)); // credenciais erradas
    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.login(WRONG_USERNAME, WRONG_PASSWORD);
    });
    expect(success).toBe(false);
    expect(result.current.user).toBeNull();

    fetchMock.mockResolvedValueOnce(jsonResponse(makeUser('tok-2')));
    await act(async () => {
      success = await result.current.login(VALID_USERNAME, VALID_PASSWORD);
    });
    expect(success).toBe(true);
    expect(result.current.user).toEqual(makeUser('tok-2'));

    expect(fetchMock).toHaveBeenLastCalledWith(
      `${API_URL}/login`,
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    );
  });

  it('logout limpa o usuário mesmo se a chamada ao backend falhar', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse(makeUser('tok-1')));

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.initializing).toBe(false));
    expect(result.current.user).not.toBeNull();

    fetchMock.mockRejectedValueOnce(new Error('network down'));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });

  it('fetchAuthenticated renova o token uma vez em 403 e repete a chamada original', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse(makeUser('tok-expirado')));

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.initializing).toBe(false));

    fetchMock
      .mockResolvedValueOnce(emptyResponse(403)) // chamada original expirada
      .mockResolvedValueOnce(jsonResponse(makeUser('tok-novo'))) // refresh
      .mockResolvedValueOnce(jsonResponse([{ date: '2026-01-01', times: [] }])); // repetição com token novo

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchAuthenticated('/scheduling/id1');
    });

    expect(data).toEqual([{ date: '2026-01-01', times: [] }]);
    expect(result.current.user).toEqual(makeUser('tok-novo'));
  });

  it('fetchAuthenticated não entra em loop se o 403 persistir após o refresh', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse(makeUser('tok-1')));

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.initializing).toBe(false));

    fetchMock
      .mockResolvedValueOnce(emptyResponse(403)) // chamada original
      .mockResolvedValueOnce(jsonResponse(makeUser('tok-2'))) // refresh ok
      .mockResolvedValueOnce(emptyResponse(403)); // repetição também barrada (ex.: permissão)

    await expect(
      act(async () => {
        await result.current.fetchAuthenticated('/scheduling/id1');
      })
    ).rejects.toThrow('Request failed with status 403');

    expect(fetchMock).toHaveBeenCalledTimes(4); // bootstrap + original + refresh + repetição
  });
});
