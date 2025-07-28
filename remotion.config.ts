import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(1);
Config.setChromiumOpenGlRenderer('angle');

// Set output location
Config.setOutputLocation('public/videos');

// Enable webpack caching for faster rebuilds
Config.setWebpackCaching(true);

// Set default codec
Config.setCodec('h264');

export {};