import type {Clan,Difficulty} from './store';

// once: the clip plays a single time and rests on its final frame (the pose it ends on).
export type FaceMedia={image:string;mediumImage?:string;video?:string;flipX?:boolean;once?:boolean};
// Hard uses the adopted stage-3 clips as-is, so Sakuya's stage-1 mirror does not apply.
const kogaFaceMedia:Partial<Record<number,FaceMedia&{hard:FaceMedia}>>={
 0:{image:'/assets/sakuya.png',video:'/assets/sakuya-medium.mp4',flipX:true,hard:{image:'/assets/sakuya-hard.webp',video:'/assets/sakuya-hard.mp4'}},
 1:{image:'/assets/xiaolan.webp',video:'/assets/xiaolan-medium.mp4',hard:{image:'/assets/xiaolan-hard.webp',video:'/assets/xiaolan-hard.mp4'}},
 2:{image:'/assets/nemu.webp',video:'/assets/nemu-medium.mp4',hard:{image:'/assets/nemu-hard.webp',video:'/assets/nemu-hard.mp4'}},
 3:{image:'/assets/izuna.webp',video:'/assets/izuna-medium.mp4',hard:{image:'/assets/izuna-hard.webp',video:'/assets/izuna-hard.mp4'}},
 4:{image:'/assets/uka.webp',video:'/assets/uka-medium.mp4',hard:{image:'/assets/uka-hard.webp',video:'/assets/uka-hard.mp4'}},
 5:{image:'/assets/oto.webp',video:'/assets/oto-medium.mp4',hard:{image:'/assets/oto-hard.webp',video:'/assets/oto-hard.mp4'}},
};
const igaFaceMedia:Partial<Record<number,FaceMedia&{hard?:FaceMedia}>>={
 0:{image:'/assets/iga-anne.webp',video:'/assets/iga-anne-medium.mp4',hard:{image:'/assets/iga-anne-hard.webp',video:'/assets/iga-anne-hard.mp4'}},
 1:{image:'/assets/iga-torika.webp',video:'/assets/iga-torika-medium.mp4',hard:{image:'/assets/iga-torika-hard.webp',video:'/assets/iga-torika-hard.mp4'}},
 2:{image:'/assets/iga-hayate.webp',video:'/assets/iga-hayate-medium.mp4',hard:{image:'/assets/iga-hayate-hard.webp',video:'/assets/iga-hayate-hard.mp4'}},
 3:{image:'/assets/iga-yui.webp',video:'/assets/iga-yui-medium.mp4',hard:{image:'/assets/iga-yui-hard.webp',video:'/assets/iga-yui-hard.mp4'}},
 4:{image:'/assets/iga-shion.webp',video:'/assets/iga-shion-medium.mp4',hard:{image:'/assets/iga-shion-hard.webp',video:'/assets/iga-shion-hard.mp4'}},
 5:{image:'/assets/iga-sekisyusai.webp',video:'/assets/iga-sekisyusai-medium.mp4',hard:{image:'/assets/iga-sekisyusai-hard.webp',video:'/assets/iga-sekisyusai-hard.mp4'}},
};
const fumaFaceMedia:Record<number,FaceMedia&{hard:FaceMedia}>={
 0:{image:'/assets/fuma-rotten.webp',video:'/assets/fuma-rotten-medium.mp4',hard:{image:'/assets/fuma-rotten-hard.webp',video:'/assets/fuma-rotten-hard.mp4'}},
 1:{image:'/assets/fuma-atoza.webp',video:'/assets/fuma-atoza-medium.mp4',hard:{image:'/assets/fuma-atoza-hard.webp',video:'/assets/fuma-atoza-hard.mp4'}},
 2:{image:'/assets/fuma-janome.webp',video:'/assets/fuma-janome-medium.mp4',hard:{image:'/assets/fuma-janome-hard.webp',video:'/assets/fuma-janome-hard.mp4'}},
 3:{image:'/assets/fuma-karma.webp',video:'/assets/fuma-karma-medium.mp4',hard:{image:'/assets/fuma-karma-hard.webp',video:'/assets/fuma-karma-hard.mp4'}},
 4:{image:'/assets/fuma-aum.webp',video:'/assets/fuma-aum-medium.mp4',hard:{image:'/assets/fuma-aum-hard.webp',video:'/assets/fuma-aum-hard.mp4'}},
 5:{image:'/assets/fuma-ibuki.webp',video:'/assets/fuma-ibuki-medium.mp4',hard:{image:'/assets/fuma-ibuki-hard.webp',video:'/assets/fuma-ibuki-hard.mp4'}},
};
const saikaFaceMedia:Record<number,FaceMedia&{hard:FaceMedia}>={
 0:{image:'/assets/saika-shiba.webp',video:'/assets/saika-shiba-medium.mp4',hard:{image:'/assets/saika-shiba-hard.webp',video:'/assets/saika-shiba-hard.mp4'}},
 1:{image:'/assets/saika-nagisa.webp',video:'/assets/saika-nagisa-medium.mp4',hard:{image:'/assets/saika-nagisa-hard.webp',video:'/assets/saika-nagisa-hard.mp4'}},
 2:{image:'/assets/saika-mami.webp',video:'/assets/saika-mami-medium.mp4',hard:{image:'/assets/saika-mami-hard.webp',video:'/assets/saika-mami-hard.mp4'}},
 3:{image:'/assets/saika-benten.webp',video:'/assets/saika-benten-medium.mp4',hard:{image:'/assets/saika-benten-hard.webp',video:'/assets/saika-benten-hard.mp4'}},
 4:{image:'/assets/saika-seori.webp',video:'/assets/saika-seori-medium.mp4',hard:{image:'/assets/saika-seori-hard.webp',video:'/assets/saika-seori-hard.mp4'}},
 5:{image:'/assets/saika-magoichi.webp',video:'/assets/saika-magoichi-medium.mp4',hard:{image:'/assets/saika-magoichi-hard.webp',video:'/assets/saika-magoichi-hard.mp4'}},
};
const nenokuniFaceMedia:Record<number,FaceMedia&{hard:FaceMedia}>={
 0:{image:'/assets/nenokuni-sasagane.webp',mediumImage:'/assets/nenokuni-sasagane-medium.webp',video:'/assets/nenokuni-sasagane-medium.mp4',hard:{image:'/assets/nenokuni-sasagane-hard.webp',video:'/assets/nenokuni-sasagane-hard.mp4'}},
 1:{image:'/assets/nenokuni-gokou.webp',mediumImage:'/assets/nenokuni-gokou-medium.webp',video:'/assets/nenokuni-gokou-medium.mp4',hard:{image:'/assets/nenokuni-gokou-hard.webp',video:'/assets/nenokuni-gokou-hard.mp4'}},
 2:{image:'/assets/nenokuni-shinra.webp',mediumImage:'/assets/nenokuni-shinra-medium.webp',video:'/assets/nenokuni-shinra-medium.mp4',hard:{image:'/assets/nenokuni-shinra-hard.webp',video:'/assets/nenokuni-shinra-hard.mp4'}},
 3:{image:'/assets/nenokuni-sasura.webp',mediumImage:'/assets/nenokuni-sasura-medium.webp',video:'/assets/nenokuni-sasura-medium.mp4',hard:{image:'/assets/nenokuni-sasura-hard.webp',video:'/assets/nenokuni-sasura-hard.mp4'}},
 4:{image:'/assets/nenokuni-yami.webp',mediumImage:'/assets/nenokuni-yami-medium.webp',video:'/assets/nenokuni-yami-medium.mp4',hard:{image:'/assets/nenokuni-yami-hard.webp',video:'/assets/nenokuni-yami-hard.mp4'}},
 5:{image:'/assets/nenokuni-yomi.webp',mediumImage:'/assets/nenokuni-yomi-medium.webp',video:'/assets/nenokuni-yomi-medium.mp4',hard:{image:'/assets/nenokuni-yomi-hard.webp',video:'/assets/nenokuni-yomi-hard.mp4'}},
};
export const faceMediaByClan:Record<Clan,Partial<Record<number,FaceMedia&{hard?:FaceMedia}>>>={甲賀:kogaFaceMedia,伊賀:igaFaceMedia,風魔:fumaFaceMedia,雑賀:saikaFaceMedia,根の国:nenokuniFaceMedia};

// Shared by the cube and the gallery: each difficulty uses exactly the same media.
export function getFaceMedia(clan:Clan,face:number,difficulty:Difficulty):FaceMedia|undefined{
 const base=faceMediaByClan[clan]?.[face];if(!base)return;
 if(difficulty==='hard')return base.hard;
 if(difficulty==='medium')return {...base,image:base.mediumImage||base.image};
 return {image:base.image,flipX:base.flipX};
}
