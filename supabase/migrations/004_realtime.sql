-- Enable Realtime for budgets and tasks tables
-- Run in Supabase SQL Editor if Realtime is not already enabled

ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
