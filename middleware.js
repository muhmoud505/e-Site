import { NextResponse } from 'next/server';

export function middleware(request) {
  const response =NextResponse.next();
   const url = request.nextUrl.pathname
   // 🟢 Block sensitive paths
    const blockedPaths = [
        '/.env', '/.env.local', '/.env.production',
        '/.git', '/node_modules', '/package.json',
        '/backup', '/backups', '/temp', '/tmp',
        '/phpinfo.php', '/phpinfo',
        '/wp-admin', '/admin',
        '/server-status', '/server-info',
    ];

    if (blockedPaths.some(path => url.toLowerCase().startsWith(path))) {
        return new NextResponse('Not Found', { status: 404 });
    }
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');
    if (request.method === 'TRACE') {
        return new NextResponse('Method Not Allowed', { status: 405 });
    }
    return response;
}
export const config = {
    matcher: '/:path*',
};
