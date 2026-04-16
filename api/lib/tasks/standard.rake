namespace :standard do
  desc "Run StandardRB linter"
  task :lint do
    sh "bundle exec standardrb"
  end

  desc "Run StandardRB linter with auto-fix"
  task :fix do
    sh "bundle exec standardrb --fix"
  end
end

desc "Run StandardRB linter (alias for standard:lint)"
task standard: "standard:lint"
