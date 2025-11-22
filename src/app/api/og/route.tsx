import { ImageResponse } from 'next/og';
import { getCategoryEmoji } from '../../lib/emoji';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const hasQ = searchParams.has('q');
        const q = hasQ ? searchParams.get('q')?.slice(0, 100) : null;

        const emoji = getCategoryEmoji('', q || '');
        const title = q || 'Ignite Your Curiosity';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: 'linear-gradient(to bottom right, #FFF7ED, #FFEDD5, #DBEAFE)',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                            borderRadius: '40px',
                            padding: '40px 60px',
                            boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
                            width: '80%',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: 80, marginBottom: 20 }}>{emoji}</div>
                        <div
                            style={{
                                fontSize: 50,
                                fontWeight: 'bold',
                                color: '#1F2937',
                                lineHeight: 1.2,
                                marginBottom: 20,
                                background: 'linear-gradient(to right, #EA580C, #DB2777)',
                                backgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            {title}
                        </div>
                        <div
                            style={{
                                fontSize: 24,
                                color: '#6B7280',
                                marginTop: 10,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ marginRight: 8 }}>🌋</span> AIgneous Million Whys
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
