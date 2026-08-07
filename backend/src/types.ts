export type SignalingMessageType =
    | 'join'
    | 'joined'
    | 'full'
    | 'ready'
    | 'offer'
    | 'answer'
    | 'ice-candidate'
    | 'peer-disconnected';

export interface SignalingMessage{
    type:SignalingMessageType,
    roomId?:string,
    payload?:any,
    message?:string,
    peerCount?:number
}