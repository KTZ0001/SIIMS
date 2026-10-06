import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class JsonDB {
  private name: string;
  private filePath: string;

  constructor(name: string) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  public read(): any[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  public write(data: any[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  public async findMany(args?: any): Promise<any[]> {
    let data = this.read();

    if (args?.where) {
      data = data.filter(item => {
        for (const key in args.where) {
          const condition = args.where[key];
          // simple exact match
          if (typeof condition !== 'object') {
            if (item[key] !== condition) return false;
          } else {
            // handle basic operators like contains, gt, in
            if (condition.contains && !String(item[key]).toLowerCase().includes(String(condition.contains).toLowerCase())) return false;
            if (condition.gt && new Date(item[key]) <= new Date(condition.gt)) return false;
          }
        }
        return true;
      });
    }

    if (args?.orderBy) {
      const sortKey = Object.keys(args.orderBy)[0];
      const direction = args.orderBy[sortKey];
      data.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return direction === 'asc' ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (args?.take) {
      data = data.slice(0, args.take);
    }

    return data;
  }

  public async findUnique(args: { where: any }): Promise<any | null> {
    const data = this.read();
    const result = data.find(item => {
      for (const key in args.where) {
        if (item[key] !== args.where[key]) return false;
      }
      return true;
    });
    return result || null;
  }

  public async findFirst(args: { where: any }): Promise<any | null> {
    return this.findUnique(args);
  }

  public async create(args: { data: any }): Promise<any> {
    const data = this.read();
    const newItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...args.data
    };
    data.push(newItem);
    this.write(data);
    return newItem;
  }

  public async update(args: { where: any, data: any }): Promise<any> {
    const data = this.read();
    const index = data.findIndex(item => {
      for (const key in args.where) {
        if (item[key] !== args.where[key]) return false;
      }
      return true;
    });

    if (index === -1) throw new Error('Record not found');

    data[index] = { ...data[index], ...args.data, updatedAt: new Date().toISOString() };
    this.write(data);
    return data[index];
  }

  public async upsert(args: { where: any, update: any, create: any }): Promise<any> {
    try {
      return await this.update({ where: args.where, data: args.update });
    } catch {
      return await this.create({ data: args.create });
    }
  }

  public async delete(args: { where: any }): Promise<any> {
    const data = this.read();
    const index = data.findIndex(item => {
      for (const key in args.where) {
        if (item[key] !== args.where[key]) return false;
      }
      return true;
    });

    if (index === -1) throw new Error('Record not found');
    const deleted = data.splice(index, 1)[0];
    this.write(data);
    return deleted;
  }

  public async deleteMany(args?: { where?: any }): Promise<{count: number}> {
    if (!args?.where) {
      this.write([]);
      return { count: 0 };
    }
    let data = this.read();
    const initialLength = data.length;
    data = data.filter(item => {
      let match = true;
      for (const key in args.where) {
        if (item[key] !== args.where[key]) match = false;
      }
      return !match; // keep items that DO NOT match
    });
    this.write(data);
    return { count: initialLength - data.length };
  }

  public async count(): Promise<number> {
    return this.read().length;
  }
}

export const prisma = {
  founder: new JsonDB('founders'),
  mentor: new JsonDB('mentors'),
  investor: new JsonDB('investors'),
  incubationManager: new JsonDB('incubationManagers'),
  administrator: new JsonDB('administrators'),
  startup: new JsonDB('startups'),
  application: new JsonDB('applications'),
  meeting: new JsonDB('meetings'),
  funding: new JsonDB('funding'),
  notification: new JsonDB('notifications'),
  analytics: new JsonDB('analytics/dashboard'),
  milestone: new JsonDB('milestones'),
  resource: new JsonDB('resources')
};
