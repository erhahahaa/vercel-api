"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSession = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../db");
const session_1 = require("../types/session");
const auth_1 = require("../middlewares/auth");
const ApiSession = ({ route }) => {
    route.get('/session/', auth_1.AuthJwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const sessions = yield db_1.Session.find({
            userId: (_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b._id,
        });
        return res.json({
            success: true,
            message: 'Sessions found',
            sessions,
        });
    }));
    route.get('/session/:id', auth_1.AuthJwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const session = yield db_1.Session.findById(id);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found',
                });
            }
            return res.json({
                success: true,
                message: 'Session found',
                session,
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error });
        }
    }));
    route.post('/session', auth_1.AuthJwtMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d, _e, _f, _g;
        console.log('DATA BODY', req.body);
        try {
            // validate user
            const userId = (_d = (_c = req.auth) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d._id;
            if (!userId || typeof userId !== 'string' || userId.length === 0) {
                return res.json({
                    success: false,
                    message: 'Invalid userId',
                });
            }
            // validate exercise
            const withoutExercise = (_f = (_e = req.body) === null || _e === void 0 ? void 0 : _e.withoutExercise) !== null && _f !== void 0 ? _f : false;
            const exerciseId = (_g = req.body) === null || _g === void 0 ? void 0 : _g.exerciseId;
            if (withoutExercise !== true) {
                if (!exerciseId || typeof exerciseId !== 'string' || exerciseId.length === 0) {
                    return res.json({
                        success: false,
                        message: 'Invalid exerciseId',
                    });
                }
            }
            // validate input
            const session = session_1.SessionSchema.parse(req.body);
            // get
            // get exercise
            let exercise;
            if (withoutExercise !== true) {
                exercise = yield db_1.Exercise.findById(exerciseId);
                if (!exercise) {
                    return res.json({
                        success: false,
                        message: 'Exercise not found',
                    });
                }
            }
            // get user
            const user = yield db_1.User.findById(userId);
            if (!user) {
                return res.json({
                    success: false,
                    message: 'User not found',
                });
            }
            // save to db
            const created = yield db_1.Session.create(Object.assign(Object.assign({}, session), { _id: new mongoose_1.default.Types.ObjectId().toHexString(), userId: user._id, exercise,
                withoutExercise }));
            // resposne
            return res.json({
                success: true,
                message: 'Session created successfully',
                id: created._id,
                session,
            });
        }
        catch (error) {
            console.log('4');
            // console.error(error)
            return res.status(400).json({ error });
        }
    }));
};
exports.ApiSession = ApiSession;
