import Counter from '../models/Counter.js';

export const getNextMemberCode = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'memberCode' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `GP-${counter.seq}`;
};