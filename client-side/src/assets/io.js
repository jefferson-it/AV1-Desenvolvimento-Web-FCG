import io from 'socket.io-client';

export const socket = io(
    // eslint-disable-next-line no-undef
    process.env.NODE_ENV === 'development' ?
        'http://localhost:3000' :
        '/'
);

