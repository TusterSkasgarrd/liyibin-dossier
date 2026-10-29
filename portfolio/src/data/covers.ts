import type { ProjectIcon } from './types';

import coverTwin from '../assets/prj-01-twin.webp';
import coverGame from '../assets/prj-02-game.webp';
import coverWriting from '../assets/prj-03-writing.webp';
import coverMedical from '../assets/prj-04-medical.webp';
import coverDb from '../assets/prj-05-db.webp';
import coverCpu from '../assets/prj-06-cpu.webp';

/** 封面由 icon 决定，数据库里只存 icon，避免 Node 端解析 .webp */
export const COVERS: Record<ProjectIcon, string> = {
  twin: coverTwin,
  game: coverGame,
  writing: coverWriting,
  medical: coverMedical,
  database: coverDb,
  cpu: coverCpu,
};
