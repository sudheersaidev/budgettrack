using backend.Models;
using backend.Models.Entities;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;

        public CategoryService(ICategoryRepository repo) => _repo = repo;

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
            => await _repo.GetAllAsync();

        public async Task<Category?> GetCategoryByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<Category> AddCategoryAsync(Category category)
        {
            await _repo.AddAsync(category);
            return category;
        }

        public async Task UpdateCategoryAsync(int id, Category category)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing != null)
            {
                existing.Name = category.Name;
                existing.Enabled = category.Enabled;
                await _repo.UpdateAsync(existing);
            }
        }

        public async Task DeleteCategoryAsync(int id)
            => await _repo.DeleteAsync(id);
    }
}